import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/user.dart';

void main() {
  test('joins first and last name', () {
    final user = User.fromJson({'email': 'ana@test.com', 'firstName': 'Ana', 'lastName': 'López'});

    expect(user.name, 'Ana López');
    expect(user.initials, 'AL');
  });

  test('uses the email as name when there is no name', () {
    final user = User.fromJson({'email': 'ana@test.com', 'firstName': null, 'lastName': null});

    expect(user.name, 'ana@test.com');
    expect(user.initials, 'A');
  });

  test('takes at most two initials', () {
    const user = User(name: 'Ana María López', email: 'ana@test.com');

    expect(user.initials, 'AM');
  });
}
