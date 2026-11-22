import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/services/nfc_service.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';
import 'package:rack_monitoring/features/scan/view_models/scan_view_model.dart';

class FakeNfcService extends Fake implements NfcService {
  FakeNfcService({this.status = NfcStatus.enabled, this.needsUserAction = false});

  final NfcStatus status;
  final tags = StreamController<String>.broadcast();

  @override
  final bool needsUserAction;

  @override
  Future<NfcStatus> checkStatus() async => status;

  @override
  Stream<String> watchTags() => tags.stream;
}

const summaries = [
  RackSummary(
    rack: Rack(id: 'rack-1', name: 'B-02', location: 'Pasillo B', rfidUid: '04aa11'),
    status: RackStatus.ok,
  ),
];

void main() {
  late FakeNfcService nfc;
  late ProviderContainer container;

  Future<void> openScan(FakeNfcService service) async {
    nfc = service;
    container = ProviderContainer.test(
      overrides: [
        nfcServiceProvider.overrideWithValue(nfc),
        rackSummariesProvider.overrideWithValue(const AsyncData(summaries)),
      ],
    );
    container.listen(scanViewModelProvider, (_, _) {});
    await container.read(scanViewModelProvider.notifier).open();
  }

  ScanState state() => container.read(scanViewModelProvider);

  Future<void> readTag(String uid) async {
    nfc.tags.add(uid);
    await pumpEventQueue();
  }

  test('finds the rack of a tag, ignoring letter case', () async {
    await openScan(FakeNfcService());
    expect(state(), isA<ScanWaiting>());

    await readTag('04AA11');

    expect(state(), isA<ScanFound>().having((found) => found.rackId, 'rackId', 'rack-1'));
  });

  test('reports the UID of a tag without rack and reads again on retry', () async {
    await openScan(FakeNfcService());

    await readTag('04BB22');
    expect(state(), isA<ScanUnknownTag>().having((unknown) => unknown.uid, 'uid', '04BB22'));

    container.read(scanViewModelProvider.notifier).scan();
    await readTag('04AA11');
    expect(state(), isA<ScanFound>());
  });

  test('stops reading after the first tag', () async {
    await openScan(FakeNfcService());

    await readTag('04BB22');
    await readTag('04AA11');

    expect(state(), isA<ScanUnknownTag>());
  });

  test('tells when NFC is missing or turned off', () async {
    await openScan(FakeNfcService(status: NfcStatus.unsupported));
    expect(state(), isA<ScanUnsupported>());

    await openScan(FakeNfcService(status: NfcStatus.disabled));
    expect(state(), isA<ScanDisabled>());
  });

  test('waits for the user where reading needs a user action', () async {
    await openScan(FakeNfcService(needsUserAction: true));
    expect(state(), isA<ScanReady>());

    container.read(scanViewModelProvider.notifier).scan();
    expect(state(), isA<ScanWaiting>());
  });

  test('finds the rack when the rack list was reloaded while its tab was hidden', () async {
    nfc = FakeNfcService();
    container = ProviderContainer.test(
      overrides: [
        nfcServiceProvider.overrideWithValue(nfc),
        rackSummariesProvider.overrideWith((ref) => Stream.value(summaries)),
      ],
    );
    final rackList = container.listen(rackSummariesProvider, (_, _) {});
    await container.read(rackSummariesProvider.future);
    rackList.pause();
    container.invalidate(rackSummariesProvider);

    container.listen(scanViewModelProvider, (_, _) {});
    await container.read(scanViewModelProvider.notifier).open();
    await readTag('04AA11');

    expect(state(), isA<ScanFound>().having((found) => found.rackId, 'rackId', 'rack-1'));
  });

  test('stops reading when the screen is hidden', () async {
    await openScan(FakeNfcService());

    container.read(scanViewModelProvider.notifier).close();
    await readTag('04AA11');

    expect(state(), isA<ScanChecking>());
  });
}
