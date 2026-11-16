import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/node_summary.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/shared/widgets/relative_time.dart';
import 'package:rack_monitoring/shared/widgets/status_badge.dart';

class NodeCard extends StatelessWidget {
  const NodeCard(this.node, {super.key, this.onTap});

  final NodeSummary node;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final muted = theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant);
    final lastSeen = node.lastSeen;

    String detail(String label, String? value) => '$label ${value ?? '—'}';

    return Card.outlined(
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
                    child: Text(node.name, style: theme.textTheme.titleMedium, overflow: TextOverflow.ellipsis),
                  ),
                  StatusBadge(
                    node.isOnline ? RackStatus.ok : RackStatus.offline,
                    label: node.isOnline ? 'En línea' : 'Sin conexión',
                  ),
                ],
              ),
              Text(
                node.rackName == null ? 'Sin rack asignado' : 'Rack ${node.rackName}',
                style: theme.textTheme.bodyMedium,
              ),
              Wrap(
                spacing: 16,
                runSpacing: 4,
                children: [
                  Text(detail('MAC', node.mac), style: muted),
                  Text(detail('IP', node.ip), style: muted),
                  Text(detail('Firmware', node.firmwareVersion), style: muted),
                  Text(detail('Señal', node.signalDbm == null ? null : '${node.signalDbm} dBm'), style: muted),
                ],
              ),
              if (lastSeen == null)
                Text('Sin datos del nodo', style: muted)
              else if (node.isOnline)
                RelativeTime(lastSeen, prefix: 'Último dato ', style: muted)
              else
                Text('Último dato ${formatDateTime(lastSeen)}', style: muted),
            ],
          ),
        ),
      ),
    );
  }
}
