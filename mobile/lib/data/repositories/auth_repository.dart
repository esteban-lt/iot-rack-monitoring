import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/models/user.dart';
import 'package:rack_monitoring/data/services/auth_api.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.watch(authApiProvider), ref.watch(sessionStorageProvider)),
);

class AuthRepository {
  const AuthRepository(this._authApi, this._session);

  final AuthApi _authApi;
  final SessionStorage _session;

  Future<void> login({required String email, required String password, required bool keepSession}) async {
    final tokens = SessionTokens.fromJson(await _authApi.login(email, password));
    await _session.start(tokens, keepSession: keepSession);
  }

  Future<User> getCurrentUser() async => User.fromJson(await _authApi.getCurrentUser());

  Future<void> logout() async {
    try {
      await _authApi.logout();
    } on DioException {
      // The local session is cleared even if ThingsBoard can't be reached
    }
    await _session.clear();
  }
}
