final _emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

String? validateEmail(String? value) => _emailPattern.hasMatch(value?.trim() ?? '') ? null : 'Ingresa un correo válido';

String? validatePassword(String? value) => (value ?? '').isEmpty ? 'Ingresa tu contraseña' : null;
