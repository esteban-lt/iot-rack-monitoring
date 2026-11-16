import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';

void main() {
  test('uses the status reported by an active node', () {
    expect(RackStatus.resolve('warning', isActive: true), RackStatus.warning);
  });

  test('is offline when the node is not active', () {
    expect(RackStatus.resolve('alarm', isActive: false), RackStatus.offline);
  });

  test('is offline when the status is missing or unknown', () {
    expect(RackStatus.resolve(null, isActive: true), RackStatus.offline);
    expect(RackStatus.resolve('broken', isActive: true), RackStatus.offline);
  });
}
