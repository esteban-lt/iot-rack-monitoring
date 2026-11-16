import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/theme/status_colors.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/shared/widgets/status_badge.dart';

class StatusBanner extends StatelessWidget {
  const StatusBanner({super.key, required this.status, required this.message});

  final RackStatus status;
  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.extension<StatusColors>()!.of(status);

    return Card.outlined(
      color: colors.container,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: colors.color),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 8,
          children: [
            StatusBadge(status),
            Text(message, style: theme.textTheme.titleMedium?.copyWith(color: colors.onContainer)),
          ],
        ),
      ),
    );
  }
}
