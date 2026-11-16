import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/shared/widgets/status_badge.dart';

class RecentAlarmsCard extends StatelessWidget {
  const RecentAlarmsCard(this.alarms, {super.key});

  final List<Alarm> alarms;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card.outlined(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text('Alarmas recientes', style: theme.textTheme.titleMedium),
          ),
          if (alarms.isEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text('Este rack no tiene alarmas.', style: theme.textTheme.bodyMedium),
            ),
          for (final alarm in alarms)
            ListTile(
              title: Text(alarm.type),
              subtitle: Text(
                '${formatDateTime(alarm.createdAt)} · ${alarm.isAcknowledged ? 'Reconocida' : 'Sin reconocer'}',
              ),
              trailing: StatusBadge(alarm.severity.tone, label: alarm.severity.label),
            ),
        ],
      ),
    );
  }
}
