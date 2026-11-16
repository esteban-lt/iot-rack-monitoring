import 'package:flutter/material.dart';

// Centered icon, title and description for empty and error states
class MessageState extends StatelessWidget {
  const MessageState({super.key, required this.icon, required this.title, required this.description, this.action});

  final IconData icon;
  final String title;
  final String description;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            Icon(icon, size: 48, color: theme.colorScheme.onSurfaceVariant),
            Text(title, style: theme.textTheme.titleMedium, textAlign: TextAlign.center),
            Text(
              description,
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            ?action,
          ],
        ),
      ),
    );
  }
}
