import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/config/env.dart';
import 'package:rack_monitoring/core/network/auth_interceptor.dart';
import 'package:rack_monitoring/core/network/session_refresher.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

final thingsboardClientProvider = Provider<Dio>((ref) {
  final client = Dio(
    BaseOptions(
      baseUrl: Env.apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  client.interceptors.add(
    AuthInterceptor(
      session: ref.watch(sessionStorageProvider),
      refresher: ref.watch(sessionRefresherProvider),
      client: client,
    ),
  );

  ref.onDispose(client.close);
  return client;
});
