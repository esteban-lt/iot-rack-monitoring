import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/node_summary.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/models/thresholds.dart';
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
  Stream<List<RackSummary>> watchRackSummaries() => _watchRacksAndNodes(buildRackSummaries);

  // Emits every node with its assigned rack, and again on each live change
  Stream<List<NodeSummary>> watchNodeSummaries() => _watchRacksAndNodes(buildNodeSummaries);

  Stream<T> _watchRacksAndNodes<T>(T Function(List<EntityData> racks, Iterable<EntityData> nodes) build) async* {
    while (true) {
      final (racks, nodes) = await (_rackApi.getRacks(), _deviceApi.getNodes()).wait;
      final nodeById = {for (final node in nodes) node.id: node};
      yield build(racks, nodes);

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
        yield build(racks, nodeById.values);
      }

      if (!hasNewLinks) return;
    }
  }

  Future<Thresholds> getThresholds(String nodeId) async =>
      Thresholds.fromAttributes(await _deviceApi.getAttributes(nodeId, Thresholds.attributeKeys));

  // Turns the buzzer off until the rack is back to normal
  Future<void> silenceAlarm(String nodeId) async {
    final reply = await _deviceApi.sendCommand(nodeId, 'silenceAlarm');
    if (reply is Map && reply['ok'] == false) throw NodeCommandRejected('${reply['error'] ?? 'rejected'}');
  }
}

class NodeCommandRejected implements Exception {
  const NodeCommandRejected(this.reason);

  final String reason;
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
Map<String, EntityData> _nodeByTag(Iterable<EntityData> nodes) {
  final readings = nodes.where((node) => _rackTagOf(node) != null).toList()
    ..sort((a, b) => _rackTagReadAt(b).compareTo(_rackTagReadAt(a)));

  final nodeByTag = <String, EntityData>{};
  for (final node in readings) {
    nodeByTag.putIfAbsent(_rackTagOf(node)!, () => node);
  }
  return nodeByTag;
}

String? _tagOfRack(EntityData rack) => rack.valueOf('SERVER_ATTRIBUTE', 'rfid_uid')?.toUpperCase();

String _nameOfRack(EntityData rack) =>
    rack.valueOf('SERVER_ATTRIBUTE', 'rack_name') ?? rack.valueOf('ENTITY_FIELD', 'name') ?? '';

List<RackSummary> buildRackSummaries(Iterable<EntityData> racks, Iterable<EntityData> nodes) {
  final nodeByTag = _nodeByTag(nodes);
  return [for (final rack in racks) _toRackSummary(rack, nodeByTag[_tagOfRack(rack)])];
}

List<NodeSummary> buildNodeSummaries(Iterable<EntityData> racks, Iterable<EntityData> nodes) {
  final nodeByTag = _nodeByTag(nodes);
  final rackByNodeId = {
    for (final rack in racks)
      if (nodeByTag[_tagOfRack(rack)] case final node?) node.id: rack,
  };

  return [for (final node in nodes) _toNodeSummary(node, rackByNodeId[node.id])];
}

NodeSummary _toNodeSummary(EntityData node, EntityData? rack) {
  final isOnline = node.valueOf('ATTRIBUTE', 'active') == 'true';
  final lastActivity = int.tryParse(node.valueOf('ATTRIBUTE', 'lastActivityTime') ?? '');
  final signal = node.valueOf('TIME_SERIES', 'rssi');

  return NodeSummary(
    id: node.id,
    name: node.valueOf('ENTITY_FIELD', 'name') ?? '',
    isOnline: isOnline,
    mac: node.valueOf('ATTRIBUTE', 'mac'),
    ip: node.valueOf('ATTRIBUTE', 'ip'),
    firmwareVersion: node.valueOf('ATTRIBUTE', 'firmware_version'),
    signalDbm: isOnline && signal != null ? double.parse(signal).round() : null,
    lastSeen: switch ((node.latest['TIME_SERIES']?['status'], lastActivity)) {
      (final status?, _) when node.valueOf('TIME_SERIES', 'status') != null => status.ts,
      (_, final ms?) => DateTime.fromMillisecondsSinceEpoch(ms),
      _ => null,
    },
    rackId: rack?.id,
    rackName: rack == null ? null : _nameOfRack(rack),
  );
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
      name: _nameOfRack(rack),
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
