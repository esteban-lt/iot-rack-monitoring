import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/theme/theme_mode_provider.dart';
import 'package:rack_monitoring/features/auth/view_models/user_menu_view_model.dart';

const _themeLabels = {ThemeMode.system: 'Sistema', ThemeMode.light: 'Claro', ThemeMode.dark: 'Oscuro'};

class UserMenuSheet extends ConsumerWidget {
  const UserMenuSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userMenuViewModelProvider).value;
    final themeMode = ref.watch(themeModeProvider);

    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (user != null)
            ListTile(
              leading: CircleAvatar(child: Text(user.initials)),
              title: Text(user.name),
              subtitle: user.name == user.email ? null : Text(user.email),
            ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.brightness_6_outlined),
            title: const Text('Tema'),
            trailing: SegmentedButton<ThemeMode>(
              segments: [
                for (final MapEntry(key: mode, value: label) in _themeLabels.entries)
                  ButtonSegment(value: mode, label: Text(label)),
              ],
              selected: {themeMode},
              showSelectedIcon: false,
              onSelectionChanged: (selection) => ref.read(themeModeProvider.notifier).select(selection.first),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Cerrar sesión'),
            onTap: () {
              Navigator.of(context).pop();
              ref.read(userMenuViewModelProvider.notifier).logout();
            },
          ),
        ],
      ),
    );
  }
}
