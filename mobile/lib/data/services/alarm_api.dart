import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/network/thingsboard_client.dart';
import 'package:rack_monitoring/data/services/thingsboard_socket.dart';

final alarmApiProvider = Provider<AlarmApi>(
  (ref) => AlarmApi(ref.watch(thingsboardClientProvider), ref.watch(thingsboardSocketProvider)),
);

class AlarmApi {
  const AlarmApi(this._client, this._socket);

  final Dio _client;
  final ThingsboardSocket _socket;

  // Newest first; without a device it returns the alarms of every node
  Future<List<Map<String, dynamic>>> getAlarms({String? deviceId, required int pageSize}) async {
    final response = await _client.get<Map<String, dynamic>>(
      deviceId == null ? '/api/v2/alarms' : '/api/v2/alarm/DEVICE/$deviceId',
      queryParameters: {'pageSize': pageSize, 'page': 0, 'sortProperty': 'createdTime', 'sortOrder': 'DESC'},
    );
    return (response.data!['data'] as List).cast();
  }

  Future<void> acknowledgeAlarm(String alarmId) => _client.post<void>('/api/alarm/$alarmId/ack');

  Stream<int> watchActiveCount() {
    final messages = _socket.subscribe({
      'type': 'ALARM_COUNT',
      'query': {
        'entityFilter': {'type': 'entityType', 'entityType': 'DEVICE'},
        'statusList': ['ACTIVE'],
        'severityList': <String>[],
        'typeList': <String>[],
        'searchPropagatedAlarms': false,
      },
    });

    return messages.map((message) => message['count'] as int? ?? 0);
  }
}
