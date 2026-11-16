import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/app.dart';
import 'package:rack_monitoring/core/theme/theme_mode_provider.dart';
import 'package:rack_monitoring/data/models/alarm.dart';
import 'package:rack_monitoring/data/models/history_range.dart';
import 'package:rack_monitoring/data/models/node_summary.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';
import 'package:rack_monitoring/data/models/thresholds.dart';
import 'package:rack_monitoring/data/repositories/alarm_repository.dart';
import 'package:rack_monitoring/data/services/nfc_service.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';
import 'package:rack_monitoring/features/alarms/view_models/alarm_count_providers.dart';
import 'package:rack_monitoring/features/devices/view_models/devices_view_model.dart';
import 'package:rack_monitoring/features/racks/view_models/rack_detail_view_model.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

final readAt = DateTime(2026, 11, 15, 9, 41);

final alarm = Alarm(
  id: 'alarm-1',
  nodeId: 'node-1',
  type: 'Inclinación crítica',
  severity: AlarmSeverity.critical,
  createdAt: readAt,
  isActive: true,
  isAcknowledged: false,
);

final node = NodeSummary(
  id: 'node-1',
  name: 'Nodo-04',
  isOnline: true,
  mac: '24:6F:28:AA:BB:CC',
  ip: '192.168.1.20',
  firmwareVersion: '1.2.0',
  signalDbm: -61,
  lastSeen: readAt,
  rackId: 'rack-1',
  rackName: 'B-02',
);

final rackInAlarm = RackSummary(
  rack: const Rack(id: 'rack-1', name: 'B-02', location: 'Pasillo B', nodeId: 'node-1', nodeName: 'Nodo-04'),
  status: RackStatus.alarm,
  latest: (ts: readAt, tilt: 5.8, vibrationRms: 0.1),
  lastSeen: readAt,
  lastImpact: (ts: readAt, impactG: 2.35),
);

class FakeAlarmRepository extends Fake implements AlarmRepository {
  FakeAlarmRepository([this.alarms = const []]);

  final List<Alarm> alarms;

  @override
  Future<List<Alarm>> getAlarms({required int limit}) async => alarms;
}

class FakeNfcService extends Fake implements NfcService {
  @override
  Future<NfcStatus> checkStatus() async => NfcStatus.unsupported;
}

Future<void> pumpApp(
  WidgetTester tester, {
  required bool hasSession,
  List<RackSummary> summaries = const [],
  List<Alarm> alarms = const [],
  List<NodeSummary> nodes = const [],
}) async {
  FlutterSecureStorage.setMockInitialValues({});
  SharedPreferences.setMockInitialValues({});

  final session = SessionStorage();
  if (hasSession) await session.start(const SessionTokens(token: 'a', refreshToken: 'b'), keepSession: false);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        sessionStorageProvider.overrideWithValue(session),
        sharedPreferencesProvider.overrideWithValue(await SharedPreferences.getInstance()),
        rackSummariesProvider.overrideWithValue(AsyncData(summaries)),
        nodeSummariesProvider.overrideWithValue(AsyncData(nodes)),
        thresholdsProvider.overrideWith(
          (ref, nodeId) => const Thresholds(tiltWarnDeg: 3, tiltAlarmDeg: 5, impactG: 1.8),
        ),
        tiltHistoryProvider.overrideWith((ref, query) => <TiltPoint>[(ts: readAt, tilt: 5.8)]),
        rackAlarmsProvider.overrideWith((ref, nodeId) => alarms),
        activeAlarmCountProvider.overrideWithValue(const AsyncData(0)),
        unacknowledgedAlarmCountProvider.overrideWithValue(const AsyncData(3)),
        alarmRepositoryProvider.overrideWithValue(FakeAlarmRepository(alarms)),
        nfcServiceProvider.overrideWithValue(FakeNfcService()),
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
    expect(find.text('No hay alertas'), findsOneWidget);
  });

  testWidgets('shows the unacknowledged alarms on the alarms tab', (tester) async {
    await pumpApp(tester, hasSession: true);

    expect(find.widgetWithText(Badge, '3'), findsOneWidget);
  });

  testWidgets('checks NFC when the scan tab is opened', (tester) async {
    await pumpApp(tester, hasSession: true);
    expect(find.text('Este dispositivo no tiene NFC'), findsNothing);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Escanear'));
    await tester.pumpAndSettle();

    expect(find.text('Este dispositivo no tiene NFC'), findsOneWidget);
  });

  testWidgets('fits a small screen with large text', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.6;
    addTearDown(tester.view.reset);
    addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

    // An overflow fails the test on any of these screens
    await pumpApp(tester, hasSession: true, summaries: [rackInAlarm], alarms: [alarm], nodes: [node]);
    expect(find.textContaining('B-02', findRichText: true), findsOneWidget);

    await tester.tap(find.textContaining('B-02', findRichText: true));
    await tester.pumpAndSettle();
    expect(find.text('Silenciar alarma'), findsOneWidget);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Alertas'));
    await tester.pumpAndSettle();
    expect(find.text('Inclinación crítica'), findsOneWidget);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Escanear'));
    await tester.pumpAndSettle();
    expect(find.text('Este dispositivo no tiene NFC'), findsOneWidget);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Dispositivos'));
    await tester.pumpAndSettle();
    expect(find.text('Nodo-04'), findsOneWidget);
  });

  testWidgets('the login fits a small screen with large text', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    tester.platformDispatcher.textScaleFactorTestValue = 1.6;
    addTearDown(tester.view.reset);
    addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

    await pumpApp(tester, hasSession: false);

    expect(find.widgetWithText(FilledButton, 'Iniciar sesión'), findsOneWidget);
  });
}
