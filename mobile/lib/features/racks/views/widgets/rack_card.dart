import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/theme/status_colors.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/shared/widgets/relative_time.dart';
import 'package:rack_monitoring/shared/widgets/status_badge.dart';

class RackCard extends StatelessWidget {
  const RackCard(this.summary, {super.key, required this.onTap});

  final RackSummary summary;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final RackSummary(:rack, :status, :latest, :lastSeen) = summary;
    final theme = Theme.of(context);
    final muted = theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant);
    final alarmColors = theme.extension<StatusColors>()!.of(RackStatus.alarm);
    final isAlarm = status == RackStatus.alarm;

    return Card.outlined(
      color: isAlarm ? alarmColors.container : null,
      shape: isAlarm
          ? RoundedRectangleBorder(
              side: BorderSide(color: alarmColors.color),
              borderRadius: BorderRadius.circular(12),
            )
          : null,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 8,
            children: [
              Row(
                spacing: 8,
                children: [
                  Expanded(
                    child: Text.rich(
                      TextSpan(
                        text: rack.name,
                        style: theme.textTheme.titleMedium,
                        children: [TextSpan(text: '  ${rack.location}', style: muted)],
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  StatusBadge(status),
                ],
              ),
              // The time moves to its own line when the text is large
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.end,
                spacing: 8,
                children: [
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.end,
                    spacing: 8,
                    children: [
                      Text(
                        latest == null ? '—' : '${latest.tilt.toStringAsFixed(1)}°',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          color: isAlarm ? alarmColors.onContainer : null,
                        ),
                      ),
                      Text(latest == null ? 'sin lectura' : 'inclinación', style: muted),
                    ],
                  ),
                  if (latest != null)
                    RelativeTime(latest.ts, style: muted)
                  else
                    Text(
                      rack.nodeId == null
                          ? 'Sin nodo asignado'
                          : lastSeen == null
                          ? 'Sin datos del nodo'
                          : 'último dato ${formatDateTime(lastSeen)}',
                      style: muted,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
