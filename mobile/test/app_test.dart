import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/app.dart';

void main() {
  testWidgets('starts on racks and switches tabs from the navigation bar', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: App()));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Racks'), findsOneWidget);

    await tester.tap(find.widgetWithText(NavigationDestination, 'Alertas'));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Alertas'), findsOneWidget);
  });
}
