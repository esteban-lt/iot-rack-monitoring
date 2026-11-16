import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/utils/validators.dart';
import 'package:rack_monitoring/features/auth/view_models/login_view_model.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _keepSession = true;
  bool _isPasswordHidden = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    ref
        .read(loginViewModelProvider.notifier)
        .login(email: _emailController.text.trim(), password: _passwordController.text, keepSession: _keepSession);
  }

  @override
  Widget build(BuildContext context) {
    final login = ref.watch(loginViewModelProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Form(
                key: _formKey,
                child: AutofillGroup(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Icon(Icons.dns, size: 48, color: theme.colorScheme.primary),
                      const SizedBox(height: 16),
                      Text('Monitoreo de racks', style: theme.textTheme.headlineMedium, textAlign: TextAlign.center),
                      const SizedBox(height: 8),
                      Text(
                        'Inicia sesión con tu cuenta de ThingsBoard para ver el estado de los racks y recibir alertas.',
                        style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Correo electrónico',
                          prefixIcon: Icon(Icons.mail_outline),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.email],
                        validator: validateEmail,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        decoration: InputDecoration(
                          labelText: 'Contraseña',
                          prefixIcon: const Icon(Icons.lock_outline),
                          border: const OutlineInputBorder(),
                          suffixIcon: IconButton(
                            icon: Icon(_isPasswordHidden ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                            tooltip: _isPasswordHidden ? 'Mostrar contraseña' : 'Ocultar contraseña',
                            onPressed: () => setState(() => _isPasswordHidden = !_isPasswordHidden),
                          ),
                        ),
                        obscureText: _isPasswordHidden,
                        autofillHints: const [AutofillHints.password],
                        validator: validatePassword,
                        onFieldSubmitted: (_) => _submit(),
                      ),
                      const SizedBox(height: 8),
                      CheckboxListTile(
                        value: _keepSession,
                        onChanged: (value) => setState(() => _keepSession = value ?? false),
                        title: const Text('Mantener la sesión iniciada'),
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                      ),
                      if (login.hasError) ...[
                        Text(
                          loginErrorMessage(login.error!),
                          style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.error),
                        ),
                        const SizedBox(height: 8),
                      ],
                      const SizedBox(height: 8),
                      FilledButton(
                        onPressed: login.isLoading ? null : _submit,
                        child: Text(login.isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '¿Problemas para ingresar? Contacta al administrador.',
                        style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
