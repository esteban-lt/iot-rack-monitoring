import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:quick_actions/quick_actions.dart';
import 'package:rack_monitoring/core/router/app_router.dart';

const _scanShortcut = 'scan';

// Adds "Escanear tag" to the menu shown when the app icon is long pressed
void setUpAppShortcuts(GoRouter router) {
  if (kIsWeb) return;

  const QuickActions()
    ..initialize((shortcut) {
      if (shortcut == _scanShortcut) router.go(AppRoutes.scan);
    })
    ..setShortcutItems(const [ShortcutItem(type: _scanShortcut, localizedTitle: 'Escanear tag')]);
}
