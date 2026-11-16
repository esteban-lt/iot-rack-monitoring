import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/user.dart';
import 'package:rack_monitoring/data/repositories/auth_repository.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';

final userMenuViewModelProvider = AsyncNotifierProvider<UserMenuViewModel, User>(UserMenuViewModel.new);

class UserMenuViewModel extends AsyncNotifier<User> {
  @override
  Future<User> build() {
    // Another account may log in after the session ends
    final session = ref.watch(sessionStorageProvider);
    session.addListener(ref.invalidateSelf);
    ref.onDispose(() => session.removeListener(ref.invalidateSelf));

    if (!session.hasSession) throw StateError('No session');
    return ref.watch(authRepositoryProvider).getCurrentUser();
  }

  Future<void> logout() => ref.read(authRepositoryProvider).logout();
}
