import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/config/env.dart';
import 'package:rack_monitoring/core/network/auth_interceptor.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

final thingsboardClientProvider = Provider<Dio>((ref) {
  final options = BaseOptions(
    baseUrl: Env.apiUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
  );
  final client = Dio(options);
  final refreshClient = Dio(options);

  client.interceptors.add(
    AuthInterceptor(session: ref.watch(sessionStorageProvider), client: client, refreshClient: refreshClient),
  );

  ref.onDispose(client.close);
  ref.onDispose(refreshClient.close);
  return client;
});
