import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarms_view_model.dart';

Alarm alarmAt(DateTime createdAt) => Alarm(
  id: '${createdAt.millisecondsSinceEpoch}',
  nodeId: 'node-1',
  type: 'Inclinación',
  severity: AlarmSeverity.critical,
  createdAt: createdAt,
  isActive: true,
  isAcknowledged: false,
);

void main() {
  final now = DateTime(2026, 11, 15, 0, 30);

  test('groups alarms under today, yesterday or their date', () {
    final alarms = [
      alarmAt(DateTime(2026, 11, 15, 0, 10)),
      alarmAt(DateTime(2026, 11, 14, 23, 50)),
      alarmAt(DateTime(2026, 11, 14, 8)),
      alarmAt(DateTime(2026, 11, 9, 16, 20)),
    ];

    final days = groupAlarmsByDay(alarms, now);

    expect([for (final day in days) (day.label, day.alarms.length)], [('Hoy', 1), ('Ayer', 2), ('09/11/26', 1)]);
  });

  test('uses calendar days, not the last 24 hours', () {
    final lateYesterday = alarmAt(DateTime(2026, 11, 14, 23, 59));

    expect(groupAlarmsByDay([lateYesterday], now).single.label, 'Ayer');
  });

  test('returns no days without alarms', () {
    expect(groupAlarmsByDay([], now), isEmpty);
  });
}
