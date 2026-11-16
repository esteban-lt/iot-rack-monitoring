import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/services/thingsboard_socket.dart';

// True while live data is not arriving
final isOfflineProvider = Provider.autoDispose<bool>((ref) {
  final isReconnecting = ref.watch(thingsboardSocketProvider).isReconnecting;
  isReconnecting.addListener(ref.invalidateSelf);
  ref.onDispose(() => isReconnecting.removeListener(ref.invalidateSelf));

  return isReconnecting.value;
});
