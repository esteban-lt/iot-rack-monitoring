import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/core/utils/validators.dart';

void main() {
  test('accepts a valid email, ignoring surrounding spaces', () {
    expect(validateEmail(' ana@test.com '), isNull);
  });

  test('rejects empty and malformed emails', () {
    for (final email in [null, '', 'ana', 'ana@test', 'ana @test.com']) {
      expect(validateEmail(email), isNotNull, reason: '$email');
    }
  });

  test('requires a password', () {
    expect(validatePassword(''), isNotNull);
    expect(validatePassword('secret'), isNull);
  });
}
