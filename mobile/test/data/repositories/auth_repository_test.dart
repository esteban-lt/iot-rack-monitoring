import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/repositories/auth_repository.dart';
import 'package:rack_monitoring/data/services/auth_api.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

class MockAuthApi extends Mock implements AuthApi {}

void main() {
  late MockAuthApi authApi;
  late SessionStorage session;
  late AuthRepository repository;

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
    authApi = MockAuthApi();
    session = SessionStorage();
    repository = AuthRepository(authApi, session);
  });

  test('starts the session with the tokens from the login', () async {
    when(() => authApi.login('ana@test.com', 'secret')).thenAnswer((_) async => {'token': 'a', 'refreshToken': 'b'});

    await repository.login(email: 'ana@test.com', password: 'secret', keepSession: false);

    expect(session.tokens?.token, 'a');
  });

  test('does not start a session when the login fails', () async {
    when(() => authApi.login(any(), any())).thenThrow(DioException(requestOptions: RequestOptions()));

    await expectLater(
      repository.login(email: 'ana@test.com', password: 'wrong', keepSession: false),
      throwsA(isA<DioException>()),
    );
    expect(session.hasSession, isFalse);
  });

  test('clears the session even if the logout request fails', () async {
    await session.start(const SessionTokens(token: 'a', refreshToken: 'b'), keepSession: false);
    when(() => authApi.logout()).thenThrow(DioException(requestOptions: RequestOptions()));

    await repository.logout();

    expect(session.hasSession, isFalse);
  });
}
