import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/core/network/auth_interceptor.dart';
import 'package:rack_monitoring/core/network/session_refresher.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

class FakeAdapter implements HttpClientAdapter {
  FakeAdapter(this.respond);

  final ResponseBody Function(RequestOptions options) respond;
  int requestCount = 0;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requestCount++;
    return respond(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody jsonResponse(int statusCode, Object body) => ResponseBody.fromString(
  jsonEncode(body),
  statusCode,
  headers: {
    Headers.contentTypeHeader: [Headers.jsonContentType],
  },
);

void main() {
  late SessionStorage session;
  late Dio client;
  late FakeAdapter refreshAdapter;

  // The API only accepts the renewed token
  ResponseBody answerApi(RequestOptions options) => options.headers['X-Authorization'] == 'Bearer new'
      ? jsonResponse(200, {'ok': true})
      : jsonResponse(401, {'message': 'Token has expired'});

  Future<void> setUpClient(ResponseBody Function(RequestOptions options) answerRefresh) async {
    FlutterSecureStorage.setMockInitialValues({});
    session = SessionStorage();
    await session.start(const SessionTokens(token: 'old', refreshToken: 'refresh'), keepSession: false);

    refreshAdapter = FakeAdapter(answerRefresh);
    final options = BaseOptions(baseUrl: 'https://thingsboard.test');
    final refreshClient = Dio(options)..httpClientAdapter = refreshAdapter;

    client = Dio(options)..httpClientAdapter = FakeAdapter(answerApi);
    client.interceptors.add(
      AuthInterceptor(session: session, refresher: SessionRefresher(session, refreshClient), client: client),
    );
  }

  ResponseBody renewTokens(RequestOptions options) => jsonResponse(200, {'token': 'new', 'refreshToken': 'refresh'});

  test('renews the token and retries the request after a 401', () async {
    await setUpClient(renewTokens);

    final response = await client.get<Map<String, dynamic>>('/api/auth/user');

    expect(response.data, {'ok': true});
    expect(session.tokens?.token, 'new');
  });

  test('shares one refresh between requests that fail together', () async {
    await setUpClient(renewTokens);

    await Future.wait([client.get<void>('/api/first'), client.get<void>('/api/second')]);

    expect(refreshAdapter.requestCount, 1);
  });

  test('ends the session when the refresh token is rejected', () async {
    await setUpClient((options) => jsonResponse(401, {'message': 'Refresh token has expired'}));

    await expectLater(client.get<void>('/api/auth/user'), throwsA(isA<DioException>()));

    expect(session.hasSession, isFalse);
  });

  test('keeps the session when the refresh fails without a response', () async {
    await setUpClient((options) => throw DioException.connectionError(requestOptions: options, reason: 'offline'));

    await expectLater(client.get<void>('/api/auth/user'), throwsA(isA<DioException>()));

    expect(session.hasSession, isTrue);
  });
}
