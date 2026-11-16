import 'dart:async';

import 'package:app_settings/app_settings.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:nfc_manager/nfc_manager_android.dart';
import 'package:nfc_manager/nfc_manager_ios.dart';
import 'package:rack_monitoring/core/utils/tag_uid.dart';

final nfcServiceProvider = Provider<NfcService>((ref) => const NfcService());

enum NfcStatus { enabled, disabled, unsupported }

class NfcService {
  const NfcService();

  bool get _isIos => defaultTargetPlatform == TargetPlatform.iOS;

  // On iOS reading shows a system sheet, so it must start from a user action
  bool get needsUserAction => _isIos;

  Future<NfcStatus> checkStatus() async {
    final hasPlugin = !kIsWeb && (_isIos || defaultTargetPlatform == TargetPlatform.android);
    if (!hasPlugin) return NfcStatus.unsupported;

    return switch (await NfcManager.instance.checkAvailability()) {
      NfcAvailability.enabled => NfcStatus.enabled,
      NfcAvailability.disabled => NfcStatus.disabled,
      NfcAvailability.unsupported => NfcStatus.unsupported,
    };
  }

  // Emits the UID of each tag while there is a listener; it closes if the user dismisses the iOS sheet
  Stream<String> watchTags() {
    final tags = StreamController<String>();

    tags.onListen = () => NfcManager.instance.startSession(
      pollingOptions: {NfcPollingOption.iso14443},
      alertMessageIos: 'Acerca el iPhone al tag del rack',
      onSessionErrorIos: (_) => tags.close(),
      onDiscovered: (tag) {
        final id = _isIos ? MiFareIos.from(tag)?.identifier : NfcTagAndroid.from(tag)?.id;
        if (id != null) tags.add(formatTagUid(id));
      },
    );
    tags.onCancel = () => NfcManager.instance.stopSession();

    return tags.stream;
  }

  Future<void> openSettings() => AppSettings.openAppSettings(type: AppSettingsType.nfc);
}
