import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/core/network/retry.dart';

DioException errorWithStatus(int? statusCode) {
  final request = RequestOptions();
  final response = statusCode == null ? null : Response<void>(requestOptions: request, statusCode: statusCode);
  return DioException(requestOptions: request, response: response);
}

void main() {
  test('retries server and connection errors up to three times', () {
    expect(retryServerErrors(0, errorWithStatus(503)), isNotNull);
    expect(retryServerErrors(2, errorWithStatus(null)), isNotNull);
    expect(retryServerErrors(3, errorWithStatus(503)), isNull);
  });

  test('does not retry client errors', () {
    expect(retryServerErrors(0, errorWithStatus(404)), isNull);
    expect(retryServerErrors(0, StateError('No session')), isNull);
  });
}
