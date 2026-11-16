import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/data/services/alarm_api.dart';

final alarmRepositoryProvider = Provider<AlarmRepository>((ref) => AlarmRepository(ref.watch(alarmApiProvider)));

class AlarmRepository {
  const AlarmRepository(this._alarmApi);

  final AlarmApi _alarmApi;

  Future<List<Alarm>> getAlarms({required int limit}) async {
    final alarms = await _alarmApi.getAlarms(pageSize: limit);
    return alarms.map(Alarm.fromJson).toList();
  }

  Future<List<Alarm>> getNodeAlarms(String nodeId, {required int limit}) async {
    final alarms = await _alarmApi.getAlarms(deviceId: nodeId, pageSize: limit);
    return alarms.map(Alarm.fromJson).toList();
  }

  // ThingsBoard has no bulk endpoint, so each alarm is acknowledged with its own request
  Future<void> acknowledge(Iterable<Alarm> alarms) =>
      Future.wait([for (final alarm in alarms) _alarmApi.acknowledgeAlarm(alarm.id)]);

  Stream<int> watchActiveCount() => _alarmApi.watchCount('ACTIVE');

  Stream<int> watchUnacknowledgedCount() => _alarmApi.watchCount('UNACK');
}
