import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/repositories/rack_repository.dart';
import 'package:rack_monitoring/data/services/device_api.dart';
import 'package:rack_monitoring/data/services/entity_data.dart';
import 'package:rack_monitoring/data/services/rack_api.dart';

class MockRackApi extends Mock implements RackApi {}

class MockDeviceApi extends Mock implements DeviceApi {}

final readAt = DateTime(2026, 11, 15, 10);

Map<String, LatestValue> valuesAt(DateTime ts, Map<String, String> values) => {
  for (final MapEntry(:key, :value) in values.entries) key: (ts: ts, value: value),
};

EntityData rack(String id, {String tag = 'AA11', String name = 'A-01'}) => EntityData(
  id: id,
  latest: {
    'SERVER_ATTRIBUTE': valuesAt(readAt, {'rack_name': name, 'location': 'Pasillo A', 'rfid_uid': tag}),
  },
);

EntityData node(
  String id, {
  String tag = 'AA11',
  DateTime? tagReadAt,
  String active = 'true',
  Map<String, String> telemetry = const {'status': 'ok', 'tilt': '0.8', 'vib_rms': '0.02'},
}) => EntityData(
  id: id,
  latest: {
    'ENTITY_FIELD': valuesAt(readAt, {'name': 'Nodo $id'}),
    'ATTRIBUTE': {
      ...valuesAt(tagReadAt ?? readAt, {'rack_uid': tag}),
      ...valuesAt(readAt, {'active': active}),
    },
    'TIME_SERIES': valuesAt(readAt, telemetry),
  },
);

void main() {
  group('buildRackSummaries', () {
    test('links a rack to the node that read its tag, ignoring letter case', () {
      final [summary] = buildRackSummaries([rack('rack-1', tag: 'aa11')], [node('node-1')]);

      expect(summary.rack.nodeId, 'node-1');
      expect(summary.rack.nodeName, 'Nodo node-1');
      expect(summary.status, RackStatus.ok);
      expect(summary.latest?.tilt, 0.8);
    });

    test('gives the rack to the node that read the tag last', () {
      final nodes = [node('old'), node('new', tagReadAt: readAt.add(const Duration(minutes: 5)))];

      expect(buildRackSummaries([rack('rack-1')], nodes).single.rack.nodeId, 'new');
    });

    test('marks a rack without node as offline', () {
      final [summary] = buildRackSummaries([rack('rack-1')], [node('node-1', tag: 'BB22')]);

      expect(summary.rack.nodeId, isNull);
      expect(summary.status, RackStatus.offline);
    });

    test('hides the reading of an inactive node but keeps when it was last seen', () {
      final [summary] = buildRackSummaries([rack('rack-1')], [node('node-1', active: 'false')]);

      expect(summary.status, RackStatus.offline);
      expect(summary.latest, isNull);
      expect(summary.lastSeen, readAt);
    });

    test('treats empty values as missing', () {
      final silentNode = node('node-1', telemetry: {'status': '', 'impact_g': ''});
      final [summary] = buildRackSummaries([rack('rack-1')], [silentNode]);

      expect(summary.status, RackStatus.offline);
      expect(summary.lastSeen, isNull);
      expect(summary.lastImpact, isNull);
    });
  });

  group('watchRackSummaries', () {
    late MockRackApi rackApi;
    late MockDeviceApi deviceApi;
    late StreamController<List<EntityData>> changes;

    setUp(() {
      rackApi = MockRackApi();
      deviceApi = MockDeviceApi();
      changes = StreamController();

      when(rackApi.getRacks).thenAnswer((_) async => [rack('rack-1')]);
      when(deviceApi.getNodes).thenAnswer((_) async => [node('node-1')]);
      when(deviceApi.watchNodes).thenAnswer((_) => changes.stream);
    });

    test('applies live changes on top of the loaded values', () async {
      final summaries = StreamIterator(RackRepository(rackApi, deviceApi).watchRackSummaries());

      await summaries.moveNext();
      expect(summaries.current.single.status, RackStatus.ok);

      final later = readAt.add(const Duration(seconds: 5));
      changes.add([
        EntityData(
          id: 'node-1',
          latest: {
            'TIME_SERIES': valuesAt(later, {'status': 'alarm', 'tilt': '9.5'}),
          },
        ),
      ]);

      await summaries.moveNext();
      final summary = summaries.current.single;
      expect(summary.status, RackStatus.alarm);
      expect(summary.latest, (ts: later, tilt: 9.5, vibrationRms: 0.02));
      expect(summary.rack.nodeId, 'node-1');

      await summaries.cancel();
    });

    test('loads everything again when a node reads another tag', () async {
      // The reload finds the node on another rack and no more changes
      final loadedNodes = [node('node-1'), node('node-1', tag: 'BB22')];
      final liveChanges = [changes.stream, const Stream<List<EntityData>>.empty()];
      when(deviceApi.getNodes).thenAnswer((_) async => [loadedNodes.removeAt(0)]);
      when(deviceApi.watchNodes).thenAnswer((_) => liveChanges.removeAt(0));

      final summaries = StreamIterator(RackRepository(rackApi, deviceApi).watchRackSummaries());
      await summaries.moveNext();
      expect(summaries.current.single.rack.nodeId, 'node-1');

      changes.add([
        EntityData(
          id: 'node-1',
          latest: {
            'ATTRIBUTE': valuesAt(readAt, {'rack_uid': 'BB22'}),
          },
        ),
      ]);

      await summaries.moveNext();
      expect(summaries.current.single.rack.nodeId, isNull);
      verify(rackApi.getRacks).called(2);
    });
  });
}
