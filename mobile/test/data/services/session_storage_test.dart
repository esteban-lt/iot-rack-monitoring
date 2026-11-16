import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

const tokens = SessionTokens(token: 'token', refreshToken: 'refresh');

Future<SessionStorage> loadSession() async {
  final session = SessionStorage();
  await session.load();
  return session;
}

void main() {
  setUp(() => FlutterSecureStorage.setMockInitialValues({}));

  test('restores a kept session after a restart', () async {
    await SessionStorage().start(tokens, keepSession: true);

    final restored = await loadSession();
    expect(restored.tokens?.token, 'token');
  });

  test('does not store a session that is not kept', () async {
    final session = SessionStorage();
    await session.start(tokens, keepSession: false);

    expect(session.hasSession, isTrue);
    expect((await loadSession()).hasSession, isFalse);
  });

  test('stores refreshed tokens only for a kept session', () async {
    final session = await loadSession();
    await session.start(tokens, keepSession: true);
    await session.update(const SessionTokens(token: 'renewed', refreshToken: 'refresh'));

    expect((await loadSession()).tokens?.token, 'renewed');
  });

  test('removes the stored session on clear', () async {
    final session = SessionStorage();
    await session.start(tokens, keepSession: true);
    await session.clear();

    expect((await loadSession()).hasSession, isFalse);
  });

  test('notifies when the session starts and ends, not on token refreshes', () async {
    final session = SessionStorage();
    var notifications = 0;
    session.addListener(() => notifications++);

    await session.start(tokens, keepSession: false);
    await session.update(tokens);
    await session.clear();
    await session.clear();

    expect(notifications, 2);
  });
}
