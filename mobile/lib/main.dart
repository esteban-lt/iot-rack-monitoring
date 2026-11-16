import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/app.dart';
import 'package:rack_monitoring/core/network/retry.dart';
import 'package:rack_monitoring/core/theme/theme_mode_provider.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final sessionStorage = SessionStorage();
  await sessionStorage.load();
  final sharedPreferences = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      retry: retryServerErrors,
      overrides: [
        sessionStorageProvider.overrideWithValue(sessionStorage),
        sharedPreferencesProvider.overrideWithValue(sharedPreferences),
      ],
      child: const App(),
    ),
  );
}
