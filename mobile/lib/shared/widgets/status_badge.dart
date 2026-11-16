import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/theme/status_colors.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';

// Colored by status; the label can be replaced to reuse the tone for other values
class StatusBadge extends StatelessWidget {
  const StatusBadge(this.status, {super.key, this.label});

  final RackStatus status;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.extension<StatusColors>()!.of(status);

    return DecoratedBox(
      decoration: ShapeDecoration(color: colors.container, shape: const StadiumBorder()),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 6,
          children: [
            Icon(Icons.circle, size: 8, color: colors.color),
            Text(label ?? status.label, style: theme.textTheme.labelMedium?.copyWith(color: colors.onContainer)),
          ],
        ),
      ),
    );
  }
}
