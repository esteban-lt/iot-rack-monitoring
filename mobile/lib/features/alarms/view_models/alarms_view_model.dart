import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/data/repositories/alarm_repository.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarm_count_providers.dart';

final alarmsProvider = AsyncNotifierProvider.autoDispose<AlarmsViewModel, List<Alarm>>(AlarmsViewModel.new);

// The most recent alarms of every node, newest first
class AlarmsViewModel extends AsyncNotifier<List<Alarm>> {
  @override
  Future<List<Alarm>> build() {
    ref.watch(alarmChangesProvider);
    return ref.watch(alarmRepositoryProvider).getAlarms(limit: 100);
  }

  // Returns whether it worked
  Future<bool> acknowledge(Alarm alarm) async {
    final result = await AsyncValue.guard(() => ref.read(alarmRepositoryProvider).acknowledge([alarm]));
    if (!result.hasError && ref.mounted) ref.invalidateSelf();
    return !result.hasError;
  }
}

typedef AlarmDay = ({String label, List<Alarm> alarms});

// Keeps the order of the alarms; the label is "Hoy", "Ayer" or the date
List<AlarmDay> groupAlarmsByDay(List<Alarm> alarms, DateTime now) {
  final today = DateTime(now.year, now.month, now.day);
  final days = <AlarmDay>[];

  for (final alarm in alarms) {
    final created = alarm.createdAt;
    final daysAgo = today.difference(DateTime(created.year, created.month, created.day)).inDays;
    final label = switch (daysAgo) {
      0 => 'Hoy',
      1 => 'Ayer',
      _ => formatDate(created),
    };

    if (days.lastOrNull?.label == label) {
      days.last.alarms.add(alarm);
    } else {
      days.add((label: label, alarms: [alarm]));
    }
  }

  return days;
}
