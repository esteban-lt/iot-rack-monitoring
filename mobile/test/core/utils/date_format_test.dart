import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';

void main() {
  final now = DateTime(2026, 11, 15, 12);

  test('uses the largest unit that fits', () {
    expect(formatRelativeTime(now.subtract(const Duration(seconds: 5)), now), 'hace 5 s');
    expect(formatRelativeTime(now.subtract(const Duration(seconds: 90)), now), 'hace 1 min');
    expect(formatRelativeTime(now.subtract(const Duration(hours: 3)), now), 'hace 3 h');
    expect(formatRelativeTime(now.subtract(const Duration(days: 2)), now), 'hace 2 d');
  });

  test('never shows a negative time when the device clock is behind', () {
    expect(formatRelativeTime(now.add(const Duration(seconds: 3)), now), 'hace 0 s');
  });

  test('formats date and time', () {
    expect(formatDateTime(DateTime(2026, 1, 9, 8, 53)), '09/01/26 08:53');
  });
}
