import 'package:dio/dio.dart';

const _delays = [Duration(seconds: 1), Duration(seconds: 2), Duration(seconds: 4)];

// Client errors (bad id, missing entity) won't change on retry
Duration? retryServerErrors(int retryCount, Object error) {
  final isServerError = error is DioException && (error.response?.statusCode ?? 500) >= 500;
  return isServerError && retryCount < _delays.length ? _delays[retryCount] : null;
}
