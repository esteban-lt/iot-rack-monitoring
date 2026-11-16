import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/services/thingsboard_socket.dart';

String tokenExpiringAt(DateTime expiresAt) {
  final payload = base64Url.encode(utf8.encode(jsonEncode({'exp': expiresAt.millisecondsSinceEpoch ~/ 1000})));
  return 'header.${payload.replaceAll('=', '')}.signature';
}

void main() {
  final now = DateTime(2026, 11, 15, 12);

  test('a token with less than a minute left expires soon', () {
    expect(tokenExpiresSoon(tokenExpiringAt(now.add(const Duration(seconds: 30))), now), isTrue);
    expect(tokenExpiresSoon(tokenExpiringAt(now.subtract(const Duration(hours: 1))), now), isTrue);
  });

  test('a token with more time left does not expire soon', () {
    expect(tokenExpiresSoon(tokenExpiringAt(now.add(const Duration(minutes: 10))), now), isFalse);
  });
}
