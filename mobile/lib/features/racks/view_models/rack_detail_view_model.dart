import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/data/models/history_range.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/models/thresholds.dart';
import 'package:rack_monitoring/data/repositories/alarm_repository.dart';
import 'package:rack_monitoring/data/repositories/rack_repository.dart';
import 'package:rack_monitoring/data/repositories/telemetry_repository.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarm_count_providers.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';

// Null when the rack doesn't exist; it follows the live list
final rackSummaryProvider = Provider.autoDispose.family<AsyncValue<RackSummary?>, String>(
  (ref, rackId) => ref
      .watch(rackSummariesProvider)
      .whenData((summaries) => summaries.where((summary) => summary.rack.id == rackId).firstOrNull),
);

final thresholdsProvider = FutureProvider.autoDispose.family<Thresholds, String>(
  (ref, nodeId) => ref.watch(rackRepositoryProvider).getThresholds(nodeId),
);

typedef TiltHistoryQuery = ({String nodeId, HistoryRange range});

final tiltHistoryProvider = FutureProvider.autoDispose.family<List<TiltPoint>, TiltHistoryQuery>((ref, query) {
  // Keeps the chart moving while the screen is open
  final timer = Timer(const Duration(minutes: 1), ref.invalidateSelf);
  ref.onDispose(timer.cancel);

  return ref.watch(telemetryRepositoryProvider).getTiltHistory(query.nodeId, query.range);
});

final rackAlarmsProvider = FutureProvider.autoDispose.family<List<Alarm>, String>((ref, nodeId) {
  ref.watch(alarmChangesProvider);
  return ref.watch(alarmRepositoryProvider).getNodeAlarms(nodeId, limit: 50);
});

final rackActionsProvider = AsyncNotifierProvider.autoDispose.family<RackActionsViewModel, void, String>(
  RackActionsViewModel.new,
);

// Actions on the node of a rack; each one returns whether it worked
class RackActionsViewModel extends AsyncNotifier<void> {
  RackActionsViewModel(this.nodeId);

  final String nodeId;

  @override
  void build() {}

  Future<bool> silenceAlarm() => _run(() => ref.read(rackRepositoryProvider).silenceAlarm(nodeId));

  Future<bool> acknowledgeAlarms() => _run(() async {
    final alarms = await ref.read(rackAlarmsProvider(nodeId).future);
    await ref.read(alarmRepositoryProvider).acknowledge(alarms.where((alarm) => !alarm.isAcknowledged));
    ref.invalidate(rackAlarmsProvider(nodeId));
  });

  Future<bool> _run(Future<void> Function() action) async {
    state = const AsyncLoading();
    final result = await AsyncValue.guard(action);
    if (ref.mounted) state = result;
    return !result.hasError;
  }
}

// Null marks a gap, so the chart doesn't join readings that are far apart
List<TiltPoint?> splitAtGaps(List<TiltPoint> points, Duration interval) => [
  for (final (index, point) in points.indexed) ...[
    if (index > 0 && point.ts.difference(points[index - 1].ts) > interval * 3) null,
    point,
  ],
];

// Explains a status that needs attention; null when there is nothing to explain
String? statusMessage(RackSummary summary, Thresholds? thresholds) {
  final RackSummary(:rack, :status, :latest, :lastSeen) = summary;
  final tilt = '${latest?.tilt.toStringAsFixed(1)}°';

  return switch (status) {
    RackStatus.ok => null,
    RackStatus.alarm when thresholds == null => 'Inclinación crítica: $tilt',
    RackStatus.alarm => 'Inclinación crítica: $tilt sobre el límite de ${thresholds!.tiltAlarmDeg.toStringAsFixed(1)}°',
    RackStatus.warning when thresholds == null => 'Inclinación alta: $tilt',
    RackStatus.warning =>
      'Inclinación alta: $tilt sobre la advertencia de ${thresholds!.tiltWarnDeg.toStringAsFixed(1)}°',
    RackStatus.offline when rack.nodeId == null => null,
    RackStatus.offline when lastSeen == null => 'El nodo no ha enviado datos',
    RackStatus.offline => 'Sin conexión desde ${formatDateTime(lastSeen!)}',
  };
}
