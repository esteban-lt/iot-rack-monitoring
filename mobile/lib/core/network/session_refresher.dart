import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/config/env.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

final sessionRefresherProvider = Provider<SessionRefresher>((ref) {
  final client = Dio(BaseOptions(baseUrl: Env.apiUrl, connectTimeout: const Duration(seconds: 10)));
  ref.onDispose(client.close);

  return SessionRefresher(ref.watch(sessionStorageProvider), client);
});

class SessionRefresher {
  SessionRefresher(this._session, this._client);

  final SessionStorage _session;
  final Dio _client;
  Future<void>? _request;

  // Callers that ask at the same time share one request
  Future<void> refresh() => _request ??= _refresh().whenComplete(() => _request = null);

  Future<void> _refresh() async {
    try {
      final response = await _client.post<Map<String, dynamic>>(
        '/api/auth/token',
        data: {'refreshToken': _session.tokens?.refreshToken},
      );
      await _session.update(SessionTokens.fromJson(response.data!));
    } on DioException catch (error) {
      // The session only ends when ThingsBoard rejects the refresh token, not when offline
      if (error.response != null) await _session.clear();
      rethrow;
    }
  }
}
