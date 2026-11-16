import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/config/env.dart';

final thingsboardClientProvider = Provider<Dio>((ref) {
  final client = Dio(
    BaseOptions(
      baseUrl: Env.apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  ref.onDispose(client.close);
  return client;
});
