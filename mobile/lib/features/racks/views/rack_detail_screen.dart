import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/router/app_router.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/features/racks/view_models/rack_detail_view_model.dart';
import 'package:rack_monitoring/features/racks/views/widgets/recent_alarms_card.dart';
import 'package:rack_monitoring/features/racks/views/widgets/stat_card.dart';
import 'package:rack_monitoring/features/racks/views/widgets/status_banner.dart';
import 'package:rack_monitoring/features/racks/views/widgets/tilt_chart_card.dart';
import 'package:rack_monitoring/shared/widgets/message_state.dart';

class RackDetailScreen extends ConsumerWidget {
  const RackDetailScreen({super.key, required this.rackId});

  final String rackId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return switch (ref.watch(rackSummaryProvider(rackId))) {
      AsyncData(:final value?) => _RackDetail(value),
      AsyncLoading() => Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      ),
      _ => Scaffold(
        appBar: AppBar(),
        body: MessageState(
          icon: Icons.search_off,
          title: 'No se pudo cargar el rack',
          description: 'Puede que el rack ya no exista o que no haya conexión con ThingsBoard.',
          action: FilledButton.tonal(onPressed: () => context.go(AppRoutes.racks), child: const Text('Volver a racks')),
        ),
      ),
    };
  }
}

class _RackDetail extends ConsumerWidget {
  const _RackDetail(this.summary);

  final RackSummary summary;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final RackSummary(:rack, :status, :latest, :lastImpact) = summary;
    final theme = Theme.of(context);
    final nodeId = rack.nodeId;

    final thresholds = nodeId == null ? null : ref.watch(thresholdsProvider(nodeId)).value;
    final alarms = nodeId == null ? null : ref.watch(rackAlarmsProvider(nodeId)).value;
    final isBusy = nodeId != null && ref.watch(rackActionsProvider(nodeId)).isLoading;
    final message = statusMessage(summary, thresholds);
    final hasUnacknowledged = alarms?.any((alarm) => !alarm.isAcknowledged) ?? false;
    final canSilence = status == RackStatus.alarm;

    Future<void> run(Future<bool> Function() action, {required String done, required String failed}) async {
      final messenger = ScaffoldMessenger.of(context);
      final worked = await action();
      messenger.showSnackBar(SnackBar(content: Text(worked ? done : failed)));
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(rack.name),
            Text(
              [rack.location, ?rack.nodeName].where((text) => text.isNotEmpty).join(' · '),
              style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
          ],
        ),
      ),
      body: nodeId == null
          ? const MessageState(
              icon: Icons.link_off,
              title: 'Sin nodo asignado',
              description: 'Acerca un nodo al tag RFID de este rack para empezar a monitorearlo.',
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (message != null) StatusBanner(status: status, message: message),
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        label: 'Inclinación',
                        value: latest == null ? '—' : '${latest.tilt.toStringAsFixed(1)}°',
                      ),
                    ),
                    Expanded(
                      child: StatCard(
                        label: 'Vibración',
                        value: latest == null ? '—' : '${latest.vibrationRms.toStringAsFixed(2)} g',
                      ),
                    ),
                  ],
                ),
                StatCard(
                  label: 'Último impacto',
                  value: lastImpact == null ? 'Sin registros' : '${lastImpact.impactG.toStringAsFixed(2)} g',
                  detail: lastImpact == null ? null : formatDateTime(lastImpact.ts),
                ),
                TiltChartCard(nodeId: nodeId, thresholds: thresholds),
                if (thresholds != null)
                  Card.outlined(
                    child: ListTile(
                      title: const Text('Umbrales'),
                      subtitle: Text(
                        'Advertencia ${thresholds.tiltWarnDeg}° · Alarma ${thresholds.tiltAlarmDeg}° · '
                        'Impacto ${thresholds.impactG} g\nSe editan desde la app web.',
                      ),
                    ),
                  ),
                if (alarms != null) RecentAlarmsCard(alarms.take(5).toList()),
              ],
            ),
      bottomNavigationBar: nodeId == null || !(canSilence || hasUnacknowledged)
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Row(
                  spacing: 8,
                  children: [
                    if (canSilence)
                      Expanded(
                        child: FilledButton.icon(
                          icon: const Icon(Icons.volume_off_outlined),
                          label: const Text('Silenciar alarma'),
                          onPressed: isBusy
                              ? null
                              : () => run(
                                  ref.read(rackActionsProvider(nodeId).notifier).silenceAlarm,
                                  done: 'Alarma silenciada',
                                  failed: 'No se pudo silenciar la alarma',
                                ),
                        ),
                      ),
                    if (hasUnacknowledged)
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.check),
                          label: const Text('Reconocer'),
                          onPressed: isBusy
                              ? null
                              : () => run(
                                  ref.read(rackActionsProvider(nodeId).notifier).acknowledgeAlarms,
                                  done: 'Alarmas reconocidas',
                                  failed: 'No se pudieron reconocer las alarmas',
                                ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}
