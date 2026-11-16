import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/network/thingsboard_client.dart';

final authApiProvider = Provider<AuthApi>((ref) => AuthApi(ref.watch(thingsboardClientProvider)));

class AuthApi {
  const AuthApi(this._client);

  final Dio _client;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _client.post<Map<String, dynamic>>(
      '/api/auth/login',
      data: {'username': email, 'password': password},
    );
    return response.data!;
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await _client.get<Map<String, dynamic>>('/api/auth/user');
    return response.data!;
  }

  Future<void> logout() => _client.post<void>('/api/auth/logout');
}
