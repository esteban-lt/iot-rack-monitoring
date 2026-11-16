import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/models/thresholds.dart';
import 'package:rack_monitoring/features/racks/view_models/rack_detail_view_model.dart';

const thresholds = Thresholds(tiltWarnDeg: 3, tiltAlarmDeg: 5, impactG: 1.8);
final seenAt = DateTime(2026, 11, 15, 9, 41);

RackSummary summary(RackStatus status, {double? tilt, String? nodeId = 'node-1', DateTime? lastSeen}) => RackSummary(
  rack: Rack(id: 'rack-1', name: 'B-02', location: 'Pasillo B', nodeId: nodeId),
  status: status,
  latest: tilt == null ? null : (ts: seenAt, tilt: tilt, vibrationRms: 0.1),
  lastSeen: lastSeen,
);

void main() {
  test('says nothing when the rack is ok', () {
    expect(statusMessage(summary(RackStatus.ok, tilt: 0.8), thresholds), isNull);
  });

  test('compares the tilt with the threshold that was passed', () {
    expect(
      statusMessage(summary(RackStatus.alarm, tilt: 5.84), thresholds),
      'Inclinación crítica: 5.8° sobre el límite de 5.0°',
    );
    expect(
      statusMessage(summary(RackStatus.warning, tilt: 3.6), thresholds),
      'Inclinación alta: 3.6° sobre la advertencia de 3.0°',
    );
  });

  test('leaves the threshold out while it is loading', () {
    expect(statusMessage(summary(RackStatus.alarm, tilt: 5.8), null), 'Inclinación crítica: 5.8°');
  });

  test('tells since when an offline node is silent', () {
    expect(
      statusMessage(summary(RackStatus.offline, lastSeen: seenAt), thresholds),
      'Sin conexión desde 15/11/26 09:41',
    );
    expect(statusMessage(summary(RackStatus.offline), thresholds), 'El nodo no ha enviado datos');
  });

  test('says nothing for a rack without node', () {
    expect(statusMessage(summary(RackStatus.offline, nodeId: null), thresholds), isNull);
  });

  test('marks a gap where readings are far apart', () {
    const interval = Duration(minutes: 2);
    final points = [
      for (final minutes in [0, 2, 4, 30, 32]) (ts: seenAt.add(Duration(minutes: minutes)), tilt: 1.0),
    ];

    final withGaps = splitAtGaps(points, interval);

    expect(withGaps.map((point) => point == null), [false, false, false, true, false, false]);
  });
}
