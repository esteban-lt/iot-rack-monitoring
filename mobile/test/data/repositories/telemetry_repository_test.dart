import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:rack_monitoring/data/models/history_range.dart';
import 'package:rack_monitoring/data/repositories/telemetry_repository.dart';
import 'package:rack_monitoring/data/services/device_api.dart';

class MockDeviceApi extends Mock implements DeviceApi {}

void main() {
  setUpAll(() {
    registerFallbackValue(DateTime(2026));
    registerFallbackValue(Duration.zero);
  });

  test('asks for the range up to now and rounds the tilt to two decimals', () async {
    final deviceApi = MockDeviceApi();
    final ts = DateTime(2026, 11, 15, 10);

    when(
      () => deviceApi.getTelemetryHistory(
        'node-1',
        'tilt',
        start: any(named: 'start'),
        end: any(named: 'end'),
        interval: const Duration(minutes: 15),
      ),
    ).thenAnswer((_) async => [(ts: ts, value: '3.14159')]);

    final history = await TelemetryRepository(deviceApi).getTiltHistory('node-1', HistoryRange.day);
    expect(history, [(ts: ts, tilt: 3.14)]);

    final call = verify(
      () => deviceApi.getTelemetryHistory(
        any(),
        any(),
        start: captureAny(named: 'start'),
        end: captureAny(named: 'end'),
        interval: any(named: 'interval'),
      ),
    );
    final [start as DateTime, end as DateTime] = call.captured;
    expect(end.difference(start), const Duration(hours: 24));
  });
}
