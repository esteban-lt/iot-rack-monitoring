import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/repositories/auth_repository.dart';

final loginViewModelProvider = AsyncNotifierProvider.autoDispose<LoginViewModel, void>(LoginViewModel.new);

class LoginViewModel extends AsyncNotifier<void> {
  @override
  void build() {}

  Future<void> login({required String email, required String password, required bool keepSession}) async {
    state = const AsyncLoading();
    final result = await AsyncValue.guard(
      () => ref.read(authRepositoryProvider).login(email: email, password: password, keepSession: keepSession),
    );

    // A successful login leaves the screen before this point
    if (ref.mounted) state = result;
  }
}

String loginErrorMessage(Object error) {
  final isRejected = error is DioException && error.response?.statusCode == 401;
  return isRejected ? 'Correo o contraseña incorrectos.' : 'No se pudo iniciar sesión. Revisa tu conexión.';
}
