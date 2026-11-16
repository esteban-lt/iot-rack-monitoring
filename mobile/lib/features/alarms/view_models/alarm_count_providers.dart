import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/repositories/alarm_repository.dart';

// Changes whenever an alarm is raised or cleared
final activeAlarmCountProvider = StreamProvider.autoDispose<int>(
  (ref) => ref.watch(alarmRepositoryProvider).watchActiveCount(),
);

// Changes whenever an alarm is raised or acknowledged
final unacknowledgedAlarmCountProvider = StreamProvider.autoDispose<int>(
  (ref) => ref.watch(alarmRepositoryProvider).watchUnacknowledgedCount(),
);

// Alarm lists watch this to load again after any change
final alarmChangesProvider = Provider.autoDispose<(int?, int?)>(
  (ref) => (ref.watch(activeAlarmCountProvider).value, ref.watch(unacknowledgedAlarmCountProvider).value),
);
