import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/shared/widgets/status_badge.dart';

// Swiping right acknowledges the alarm; the tile stays in the list
class AlarmTile extends StatelessWidget {
  const AlarmTile({super.key, required this.alarm, required this.rackName, required this.onAcknowledge, this.onTap});

  final Alarm alarm;
  final String rackName;
  final Future<void> Function() onAcknowledge;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final muted = theme.textTheme.bodySmall?.copyWith(color: colors.onSurfaceVariant);

    return Dismissible(
      key: ValueKey(alarm.id),
      direction: alarm.isAcknowledged ? DismissDirection.none : DismissDirection.startToEnd,
      confirmDismiss: (_) async {
        await onAcknowledge();
        return false;
      },
      background: ColoredBox(
        color: colors.primaryContainer,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            spacing: 8,
            children: [
              Icon(Icons.check, color: colors.onPrimaryContainer),
              Text('Reconocer', style: theme.textTheme.labelLarge?.copyWith(color: colors.onPrimaryContainer)),
            ],
          ),
        ),
      ),
      child: ListTile(
        onTap: onTap,
        title: Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          spacing: 8,
          children: [
            Text(rackName, style: theme.textTheme.titleMedium),
            Text(formatTime(alarm.createdAt), style: muted),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(alarm.type),
            Text(
              alarm.isAcknowledged ? 'Reconocida' : '● Sin reconocer',
              style: alarm.isAcknowledged ? muted : theme.textTheme.labelMedium,
            ),
          ],
        ),
        trailing: StatusBadge(alarm.severity.tone, label: alarm.severity.label),
      ),
    );
  }
}
