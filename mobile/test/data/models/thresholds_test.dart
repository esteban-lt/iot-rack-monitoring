import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/thresholds.dart';

void main() {
  test('reads whole and decimal numbers', () {
    final thresholds = Thresholds.fromAttributes({'tilt_warn_deg': 5, 'tilt_alarm_deg': 8.5, 'impact_g': 4});

    expect(thresholds.tiltWarnDeg, 5.0);
    expect(thresholds.tiltAlarmDeg, 8.5);
    expect(thresholds.impactG, 4.0);
  });

  test('uses zero for thresholds that are not set', () {
    expect(Thresholds.fromAttributes({}).tiltAlarmDeg, 0);
  });
}
