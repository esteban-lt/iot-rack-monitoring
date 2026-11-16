import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/services/device_api.dart';
import 'package:rack_monitoring/data/services/entity_data.dart';
import 'package:rack_monitoring/data/services/rack_api.dart';

final rackRepositoryProvider = Provider<RackRepository>(
  (ref) => RackRepository(ref.watch(rackApiProvider), ref.watch(deviceApiProvider)),
);

class RackRepository {
  const RackRepository(this._rackApi, this._deviceApi);

  final RackApi _rackApi;
  final DeviceApi _deviceApi;

  // Emits every rack with its node values, and again on each live change
  Stream<List<RackSummary>> watchRackSummaries() async* {
    while (true) {
      final (racks, nodes) = await (_rackApi.getRacks(), _deviceApi.getNodes()).wait;
      final nodeById = {for (final node in nodes) node.id: node};
      yield buildRackSummaries(racks, nodes);

      var hasNewLinks = false;
      await for (final changes in _deviceApi.watchNodes()) {
        for (final change in changes) {
          final previous = nodeById[change.id];
          final merged = mergeNodeValues(previous, change);
          hasNewLinks = hasNewLinks || previous == null || rackTagChanged(previous, merged);
          nodeById[change.id] = merged;
        }

        // A node moved to another rack: load everything again
        if (hasNewLinks) break;
        yield buildRackSummaries(racks, nodeById.values);
      }

      if (!hasNewLinks) return;
    }
  }
}

EntityData mergeNodeValues(EntityData? previous, EntityData change) => EntityData(
  id: change.id,
  latest: {
    for (final type in {...?previous?.latest.keys, ...change.latest.keys})
      type: {...?previous?.latest[type], ...?change.latest[type]},
  },
);

bool rackTagChanged(EntityData previous, EntityData next) => _rackTagOf(previous) != _rackTagOf(next);

String? _rackTagOf(EntityData node) => node.valueOf('ATTRIBUTE', 'rack_uid')?.toUpperCase();

// A rack belongs to the node that read its RFID tag last
List<RackSummary> buildRackSummaries(Iterable<EntityData> racks, Iterable<EntityData> nodes) {
  final readings = nodes.where((node) => _rackTagOf(node) != null).toList()
    ..sort((a, b) => _rackTagReadAt(b).compareTo(_rackTagReadAt(a)));

  final nodeByTag = <String, EntityData>{};
  for (final node in readings) {
    nodeByTag.putIfAbsent(_rackTagOf(node)!, () => node);
  }

  return [
    for (final rack in racks)
      _toRackSummary(rack, nodeByTag[rack.valueOf('SERVER_ATTRIBUTE', 'rfid_uid')?.toUpperCase()]),
  ];
}

DateTime _rackTagReadAt(EntityData node) => node.latest['ATTRIBUTE']!['rack_uid']!.ts;

RackSummary _toRackSummary(EntityData rack, EntityData? node) {
  final telemetry = node?.latest['TIME_SERIES'] ?? {};
  final reported = node?.valueOf('TIME_SERIES', 'status');
  final status = RackStatus.resolve(reported, isActive: node?.valueOf('ATTRIBUTE', 'active') == 'true');
  final impact = node?.valueOf('TIME_SERIES', 'impact_g');

  double valueOf(String key) => double.tryParse(telemetry[key]?.value ?? '') ?? 0;

  return RackSummary(
    rack: Rack(
      id: rack.id,
      name: rack.valueOf('SERVER_ATTRIBUTE', 'rack_name') ?? rack.valueOf('ENTITY_FIELD', 'name') ?? '',
      location: rack.valueOf('SERVER_ATTRIBUTE', 'location') ?? '',
      rfidUid: rack.valueOf('SERVER_ATTRIBUTE', 'rfid_uid'),
      nodeId: node?.id,
      nodeName: node?.valueOf('ENTITY_FIELD', 'name'),
    ),
    status: status,
    latest: status == RackStatus.offline
        ? null
        : (ts: telemetry['status']!.ts, tilt: valueOf('tilt'), vibrationRms: valueOf('vib_rms')),
    lastSeen: reported == null ? null : telemetry['status']!.ts,
    lastImpact: impact == null ? null : (ts: telemetry['impact_g']!.ts, impactG: double.parse(impact)),
  );
}
