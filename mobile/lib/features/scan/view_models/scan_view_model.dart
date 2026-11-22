import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/services/nfc_service.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';

sealed class ScanState {
  const ScanState();
}

class ScanChecking extends ScanState {
  const ScanChecking();
}

class ScanUnsupported extends ScanState {
  const ScanUnsupported();
}

class ScanDisabled extends ScanState {
  const ScanDisabled();
}

// NFC is on, but reading waits for the user to ask for it
class ScanReady extends ScanState {
  const ScanReady();
}

class ScanWaiting extends ScanState {
  const ScanWaiting();
}

class ScanFound extends ScanState {
  const ScanFound(this.rackId);

  final String rackId;
}

class ScanUnknownTag extends ScanState {
  const ScanUnknownTag(this.uid);

  final String uid;
}

final scanViewModelProvider = NotifierProvider.autoDispose<ScanViewModel, ScanState>(ScanViewModel.new);

class ScanViewModel extends Notifier<ScanState> {
  StreamSubscription<String>? _tags;

  NfcService get _nfc => ref.read(nfcServiceProvider);

  @override
  ScanState build() {
    ref.onDispose(() => _tags?.cancel());
    return const ScanChecking();
  }

  // Called when the screen is shown: checks NFC and reads right away where the platform allows it
  Future<void> open() async {
    final status = await _nfc.checkStatus();
    if (!ref.mounted) return;

    switch (status) {
      case NfcStatus.unsupported:
        state = const ScanUnsupported();
      case NfcStatus.disabled:
        state = const ScanDisabled();
      case NfcStatus.enabled when _nfc.needsUserAction:
        state = const ScanReady();
      case NfcStatus.enabled:
        scan();
    }
  }

  void scan() {
    _stopReading();
    state = const ScanWaiting();
    _tags = _nfc.watchTags().listen(_onTag, onDone: () => state = const ScanReady());
  }

  // Called when the screen is hidden
  void close() {
    _stopReading();
    state = const ScanChecking();
  }

  Future<void> openNfcSettings() => _nfc.openSettings();

  Future<void> _onTag(String uid) async {
    _stopReading();
    final rackList = ref.listen(rackSummariesProvider.future, (_, _) {});
    final summaries = await AsyncValue.guard(rackList.read);
    rackList.close();
    if (!ref.mounted) return;

    // Without the rack list the tag can't be looked up; the user can read it again
    if (summaries.hasError) {
      state = const ScanReady();
      return;
    }

    final rack = findRackByTag(summaries.requireValue, uid);
    state = rack == null ? ScanUnknownTag(uid) : ScanFound(rack.id);
  }

  void _stopReading() {
    _tags?.cancel();
    _tags = null;
  }
}

Rack? findRackByTag(List<RackSummary> summaries, String uid) => summaries
    .map((summary) => summary.rack)
    .where((rack) => rack.rfidUid?.toUpperCase() == uid.toUpperCase())
    .firstOrNull;
