import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/core/utils/tag_uid.dart';

void main() {
  test('formats the bytes as uppercase hex without separators', () {
    expect(formatTagUid([0x04, 0x07, 0x18, 0x29, 0x35, 0x4A, 0x5B]), '04071829354A5B');
  });

  test('keeps the leading zero of small bytes', () {
    expect(formatTagUid([0x00, 0x0F, 0xA0]), '000FA0');
  });
}
