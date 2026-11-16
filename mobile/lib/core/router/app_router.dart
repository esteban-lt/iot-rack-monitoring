import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/router/app_shell.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';
import 'package:rack_monitoring/features/alarms/views/alarms_screen.dart';
import 'package:rack_monitoring/features/auth/views/login_screen.dart';
import 'package:rack_monitoring/features/racks/views/rack_detail_screen.dart';
import 'package:rack_monitoring/features/racks/views/racks_screen.dart';
import 'package:rack_monitoring/features/scan/views/scan_screen.dart';

abstract final class AppRoutes {
  static const login = '/login';
  static const racks = '/racks';
  static const scan = '/scan';
  static const alarms = '/alarms';

  static String rackDetail(String rackId) => '$racks/$rackId';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(sessionStorageProvider);

  final router = GoRouter(
    initialLocation: AppRoutes.racks,
    refreshListenable: session,
    redirect: (context, state) {
      final isLoginRoute = state.matchedLocation == AppRoutes.login;

      if (!session.hasSession) return isLoginRoute ? null : AppRoutes.login;
      return isLoginRoute ? AppRoutes.racks : null;
    },
    routes: [
      GoRoute(path: AppRoutes.login, builder: (context, state) => const LoginScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AppShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.racks,
                builder: (context, state) => const RacksScreen(),
                routes: [
                  GoRoute(
                    path: ':rackId',
                    builder: (context, state) => RackDetailScreen(rackId: state.pathParameters['rackId']!),
                  ),
                ],
              ),
            ],
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
