import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/network/thingsboard_client.dart';
import 'package:rack_monitoring/data/services/entity_data.dart';
import 'package:rack_monitoring/data/services/thingsboard_socket.dart';

final deviceApiProvider = Provider<DeviceApi>(
  (ref) => DeviceApi(ref.watch(thingsboardClientProvider), ref.watch(thingsboardSocketProvider)),
);

const _telemetryKeys = ['status', 'tilt', 'vib_rms', 'impact_g'];
const _attributeKeys = ['active', 'rack_uid'];

final _nodeLatestKeys = [
  for (final key in _telemetryKeys) {'type': 'TIME_SERIES', 'key': key},
  for (final key in _attributeKeys) {'type': 'ATTRIBUTE', 'key': key},
];

// The same query loads the nodes over REST and follows them over the socket
final _nodesQuery = {
  'entityFilter': {'type': 'entityType', 'entityType': 'DEVICE'},
  'pageLink': {'page': 0, 'pageSize': 100},
  'entityFields': [
    {'type': 'ENTITY_FIELD', 'key': 'name'},
  ],
  'latestValues': _nodeLatestKeys,
};

class DeviceApi {
  const DeviceApi(this._client, this._socket);

  final Dio _client;
  final ThingsboardSocket _socket;

  Future<List<EntityData>> getNodes() async {
    final response = await _client.post<Map<String, dynamic>>('/api/entitiesQuery/find', data: _nodesQuery);
    return _toEntities(response.data!['data']);
  }

  // Each event only brings the nodes and keys that changed
  Stream<List<EntityData>> watchNodes() {
    final messages = _socket.subscribe({
      'type': 'ENTITY_DATA',
      'query': _nodesQuery,
      'latestCmd': {'keys': _nodeLatestKeys},
    });

    return messages.map((message) => _toEntities(message['update'] ?? (message['data'] as Map?)?['data']));
  }
}

List<EntityData> _toEntities(Object? entities) => [
  for (final entity in entities as List? ?? []) EntityData.fromJson(entity as Map<String, dynamic>),
];
