import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarm_count_providers.dart';

class AppShell extends ConsumerWidget {
  const AppShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unacknowledged = ref.watch(unacknowledgedAlarmCountProvider).value ?? 0;

    Widget withBadge(IconData icon) =>
        Badge(isLabelVisible: unacknowledged > 0, label: Text('$unacknowledged'), child: Icon(icon));

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
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
      ),
    );
  }
}
