import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/router/app_router.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarms_view_model.dart';
import 'package:rack_monitoring/features/alarms/views/widgets/alarm_tile.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';
import 'package:rack_monitoring/shared/widgets/message_state.dart';

class AlarmsScreen extends ConsumerStatefulWidget {
  const AlarmsScreen({super.key});

  @override
  ConsumerState<AlarmsScreen> createState() => _AlarmsScreenState();
}

class _AlarmsScreenState extends ConsumerState<AlarmsScreen> {
  bool _onlyUnacknowledged = false;

  Future<void> _acknowledge(Alarm alarm) async {
    final messenger = ScaffoldMessenger.of(context);
    final worked = await ref.read(alarmsProvider.notifier).acknowledge(alarm);
    messenger.showSnackBar(SnackBar(content: Text(worked ? 'Alarma reconocida' : 'No se pudo reconocer la alarma')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alertas'), actions: const [UserMenuButton()]),
      body: switch (ref.watch(alarmsProvider)) {
        AsyncData(:final value) => _buildList(value),
        AsyncError() => MessageState(
          icon: Icons.cloud_off,
          title: 'No se pudieron cargar las alertas',
          description: 'Revisa tu conexión e inténtalo de nuevo.',
          action: FilledButton.tonal(onPressed: () => ref.invalidate(alarmsProvider), child: const Text('Reintentar')),
        ),
        AsyncLoading() => const Center(child: CircularProgressIndicator()),
      },
    );
  }

  Widget _buildList(List<Alarm> alarms) {
    final theme = Theme.of(context);
    final summaries = ref.watch(rackSummariesProvider).value ?? [];
    final rackByNodeId = {for (final summary in summaries) ?summary.rack.nodeId: summary.rack};

    final unacknowledged = alarms.where((alarm) => !alarm.isAcknowledged).toList();
    final days = groupAlarmsByDay(_onlyUnacknowledged ? unacknowledged : alarms, DateTime.now());

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            children: [
              FilterChip(
                label: const Text('Sin reconocer'),
                selected: _onlyUnacknowledged,
                onSelected: (selected) => setState(() => _onlyUnacknowledged = selected),
              ),
              Text('${unacknowledged.length} sin reconocer', style: theme.textTheme.bodySmall),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.refresh(alarmsProvider.future),
            child: days.isEmpty
                // Scrollable so pull to refresh also works on the empty state
                ? LayoutBuilder(
                    builder: (context, constraints) => SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: SizedBox(
                        height: constraints.maxHeight,
                        child: MessageState(
                          icon: Icons.notifications_none,
                          title: _onlyUnacknowledged ? 'Todo está reconocido' : 'No hay alertas',
                          description: _onlyUnacknowledged
                              ? 'No quedan alertas por reconocer.'
                              : 'Las alarmas de los racks aparecerán aquí.',
                        ),
                      ),
                    ),
                  )
                : ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      for (final day in days) ...[
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                          child: Text(day.label, style: theme.textTheme.titleSmall),
                        ),
                        for (final alarm in day.alarms)
                          AlarmTile(
                            alarm: alarm,
                            rackName: rackByNodeId[alarm.nodeId]?.name ?? 'Nodo sin rack',
                            onAcknowledge: () => _acknowledge(alarm),
                            onTap: switch (rackByNodeId[alarm.nodeId]) {
                              final rack? => () => context.go(AppRoutes.rackDetail(rack.id)),
                              null => null,
                            },
                          ),
                      ],
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}
