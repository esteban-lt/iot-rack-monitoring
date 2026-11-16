import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/router/app_shell.dart';
import 'package:rack_monitoring/features/alarms/views/alarms_screen.dart';
import 'package:rack_monitoring/features/racks/views/racks_screen.dart';
import 'package:rack_monitoring/features/scan/views/scan_screen.dart';

abstract final class AppRoutes {
  static const racks = '/racks';
  static const scan = '/scan';
  static const alarms = '/alarms';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: AppRoutes.racks,
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AppShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.racks, builder: (context, state) => const RacksScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.scan, builder: (context, state) => const ScanScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: AppRoutes.alarms, builder: (context, state) => const AlarmsScreen())],
          ),
        ],
      ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
