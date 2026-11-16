import 'package:flutter/material.dart';

class StatCard extends StatelessWidget {
  const StatCard({super.key, required this.label, required this.value, this.detail});

  final String label;
  final String value;
  final String? detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final muted = theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant);

    return Card.outlined(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 4,
          children: [
            Text(label, style: muted),
            Text(value, style: theme.textTheme.headlineSmall),
            if (detail != null) Text(detail!, style: muted),
          ],
        ),
      ),
    );
  }
}
