import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/history_range.dart';
import 'package:rack_monitoring/data/services/device_api.dart';

final telemetryRepositoryProvider = Provider<TelemetryRepository>(
  (ref) => TelemetryRepository(ref.watch(deviceApiProvider)),
);

class TelemetryRepository {
  const TelemetryRepository(this._deviceApi);

  final DeviceApi _deviceApi;

  Future<List<TiltPoint>> getTiltHistory(String nodeId, HistoryRange range) async {
    final end = DateTime.now();
    final history = await _deviceApi.getTelemetryHistory(
      nodeId,
      'tilt',
      start: end.subtract(range.duration),
      end: end,
      interval: range.interval,
    );

    return [for (final (:ts, :value) in history) (ts: ts, tilt: (double.parse(value) * 100).round() / 100)];
  }
}
