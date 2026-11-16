import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/app.dart';
import 'package:rack_monitoring/core/theme/theme_mode_provider.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> pumpApp(WidgetTester tester, {required bool hasSession}) async {
  FlutterSecureStorage.setMockInitialValues({});
  SharedPreferences.setMockInitialValues({});

  final session = SessionStorage();
  if (hasSession) await session.start(const SessionTokens(token: 'a', refreshToken: 'b'), keepSession: false);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        sessionStorageProvider.overrideWithValue(session),
        sharedPreferencesProvider.overrideWithValue(await SharedPreferences.getInstance()),
      ],
      child: const App(),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('shows the login when there is no session', (tester) async {
    await pumpApp(tester, hasSession: false);

    expect(find.widgetWithText(FilledButton, 'Iniciar sesión'), findsOneWidget);
    expect(find.byType(NavigationBar), findsNothing);
  });

  testWidgets('validates the login form before sending it', (tester) async {
    await pumpApp(tester, hasSession: false);

    await tester.tap(find.widgetWithText(FilledButton, 'Iniciar sesión'));
    await tester.pump();

    expect(find.text('Ingresa un correo válido'), findsOneWidget);
    expect(find.text('Ingresa tu contraseña'), findsOneWidget);
  });

  testWidgets('starts on racks and switches tabs from the navigation bar', (tester) async {
    await pumpApp(tester, hasSession: true);

    expect(find.widgetWithText(AppBar, 'Racks'), findsOneWidget);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Alertas'));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Alertas'), findsOneWidget);
  });
}
