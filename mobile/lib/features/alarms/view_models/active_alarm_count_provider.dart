import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/repositories/alarm_repository.dart';

// Changes whenever an alarm is raised or cleared
final activeAlarmCountProvider = StreamProvider.autoDispose<int>(
  (ref) => ref.watch(alarmRepositoryProvider).watchActiveCount(),
);
