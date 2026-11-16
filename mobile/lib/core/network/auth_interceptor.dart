import 'package:dio/dio.dart';
import 'package:rack_monitoring/core/network/session_refresher.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

// Adds the session token and renews it once when ThingsBoard answers 401
class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.session, required this.refresher, required this.client});

  static const _retryFlag = 'isRetry';

  final SessionStorage session;
  final SessionRefresher refresher;
  final Dio client;

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
      await refresher.refresh();
    } on DioException {
      return handler.next(err);
    }

    try {
      request.extra[_retryFlag] = true;
      handler.resolve(await client.fetch(request));
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }
}
