import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/data/repositories/alarm_repository.dart';
import 'package:rack_monitoring/data/services/alarm_api.dart';

class MockAlarmApi extends Mock implements AlarmApi {}

Alarm alarm(String id) => Alarm(
  id: id,
  nodeId: 'node-1',
  type: 'Impacto detectado',
  severity: AlarmSeverity.major,
  createdAt: DateTime(2026, 11, 15),
  isActive: true,
  isAcknowledged: false,
);

void main() {
  late MockAlarmApi alarmApi;

  setUp(() => alarmApi = MockAlarmApi());

  test('acknowledges every alarm with its own request', () async {
    when(() => alarmApi.acknowledgeAlarm(any())).thenAnswer((_) async {});

    await AlarmRepository(alarmApi).acknowledge([alarm('a'), alarm('b')]);

    verify(() => alarmApi.acknowledgeAlarm('a')).called(1);
    verify(() => alarmApi.acknowledgeAlarm('b')).called(1);
  });

  test('loads the alarms of a node', () async {
    when(() => alarmApi.getAlarms(deviceId: 'node-1', pageSize: 5)).thenAnswer(
      (_) async => [
        {
          'id': {'id': 'alarm-1'},
          'originator': {'id': 'node-1'},
          'type': 'Impacto detectado',
          'severity': 'MAJOR',
          'status': 'ACTIVE_ACK',
          'createdTime': 1794800000000,
        },
      ],
    );

    final [loaded] = await AlarmRepository(alarmApi).getNodeAlarms('node-1', limit: 5);

    expect(loaded.type, 'Impacto detectado');
    expect(loaded.isAcknowledged, isTrue);
  });
}
