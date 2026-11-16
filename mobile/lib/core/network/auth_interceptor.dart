import 'package:dio/dio.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

// Adds the session token and renews it once when ThingsBoard answers 401
class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.session, required this.client, required this.refreshClient});

  static const _retryFlag = 'isRetry';

  final SessionStorage session;
  final Dio client;
  final Dio refreshClient;
  Future<void>? _refreshRequest;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = session.tokens?.token;
    if (token != null) options.headers['X-Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final request = err.requestOptions;
    final isLoginRequest = request.path.startsWith('/api/auth/login');
    final isRetry = request.extra[_retryFlag] == true;

    if (err.response?.statusCode != 401 || isLoginRequest || isRetry || !session.hasSession) {
      return handler.next(err);
    }

    try {
      // Requests that fail together share one refresh
      await (_refreshRequest ??= _refreshSession().whenComplete(() => _refreshRequest = null));
    } on DioException catch (refreshError) {
      // The session only ends when ThingsBoard rejects the refresh token, not when offline
      if (refreshError.response != null) await session.clear();
      return handler.next(err);
    }

    try {
      request.extra[_retryFlag] = true;
      handler.resolve(await client.fetch(request));
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  Future<void> _refreshSession() async {
    final response = await refreshClient.post<Map<String, dynamic>>(
      '/api/auth/token',
      data: {'refreshToken': session.tokens?.refreshToken},
    );
    await session.update(SessionTokens.fromJson(response.data!));
  }
}
