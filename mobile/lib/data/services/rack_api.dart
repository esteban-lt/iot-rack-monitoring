import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/network/thingsboard_client.dart';
import 'package:rack_monitoring/data/services/entity_data.dart';

final rackApiProvider = Provider<RackApi>((ref) => RackApi(ref.watch(thingsboardClientProvider)));

class RackApi {
  const RackApi(this._client);

  final Dio _client;

  Future<List<EntityData>> getRacks() async {
    final response = await _client.post<Map<String, dynamic>>(
      '/api/entitiesQuery/find',
      data: {
        'entityFilter': {
          'type': 'assetType',
          'assetTypes': ['Rack'],
        },
        'pageLink': {'page': 0, 'pageSize': 1000},
        'entityFields': [
          {'type': 'ENTITY_FIELD', 'key': 'name'},
        ],
        'latestValues': [
          for (final key in ['rack_name', 'location', 'rfid_uid']) {'type': 'SERVER_ATTRIBUTE', 'key': key},
        ],
      },
    );

    return [for (final entity in response.data!['data'] as List) EntityData.fromJson(entity as Map<String, dynamic>)];
  }
}
