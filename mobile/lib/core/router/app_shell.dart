import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/network/connection_status.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarm_count_providers.dart';

class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unacknowledged = ref.watch(unacknowledgedAlarmCountProvider).value ?? 0;
    final isOffline = ref.watch(isOfflineProvider);
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isOffline)
            ColoredBox(
              color: colors.errorContainer,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  spacing: 8,
                  children: [
                    Icon(Icons.cloud_off, size: 18, color: colors.onErrorContainer),
                    Expanded(
                      child: Text(
                        'Sin conexión. Los datos pueden no estar al día.',
                        style: TextStyle(color: colors.onErrorContainer),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          _buildNavigationBar(unacknowledged),
        ],
      ),
    );
  }

  Widget _buildNavigationBar(int unacknowledged) {
    Widget withBadge(IconData icon) =>
        Badge(isLabelVisible: unacknowledged > 0, label: Text('$unacknowledged'), child: Icon(icon));

    return NavigationBar(
      selectedIndex: navigationShell.currentIndex,
      // Tapping the current tab goes back to its first screen
      onDestinationSelected: (index) =>
          navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
      destinations: [
        const NavigationDestination(icon: Icon(Icons.dns_outlined), selectedIcon: Icon(Icons.dns), label: 'Racks'),
        const NavigationDestination(icon: Icon(Icons.nfc), label: 'Escanear'),
        NavigationDestination(
          icon: withBadge(Icons.notifications_outlined),
          selectedIcon: withBadge(Icons.notifications),
          label: 'Alertas',
        ),
      ],
    );
  }
}
