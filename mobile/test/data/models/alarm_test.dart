import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/alarm.dart';

Map<String, dynamic> alarmJson({String status = 'ACTIVE_UNACK', String severity = 'CRITICAL'}) => {
  'id': {'id': 'alarm-1'},
  'originator': {'id': 'node-1'},
  'type': 'Inclinación crítica',
  'severity': severity,
  'status': status,
  'createdTime': 1794800000000,
};

void main() {
  test('reads the alarm fields', () {
    final alarm = Alarm.fromJson(alarmJson());

    expect(alarm.id, 'alarm-1');
    expect(alarm.nodeId, 'node-1');
    expect(alarm.severity, AlarmSeverity.critical);
    expect(alarm.createdAt, DateTime.fromMillisecondsSinceEpoch(1794800000000));
  });

  test('splits the status into active and acknowledged', () {
    final statuses = {
      'ACTIVE_UNACK': (true, false),
      'ACTIVE_ACK': (true, true),
      'CLEARED_UNACK': (false, false),
      'CLEARED_ACK': (false, true),
    };

    for (final MapEntry(key: status, value: expected) in statuses.entries) {
      final alarm = Alarm.fromJson(alarmJson(status: status));
      expect((alarm.isActive, alarm.isAcknowledged), expected, reason: status);
    }
  });

  test('falls back to indeterminate for an unknown severity', () {
    expect(Alarm.fromJson(alarmJson(severity: 'FATAL')).severity, AlarmSeverity.indeterminate);
  });
}
