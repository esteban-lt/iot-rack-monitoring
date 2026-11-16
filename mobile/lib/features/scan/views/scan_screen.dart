import 'package:flutter/material.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';

class ScanScreen extends StatelessWidget {
  const ScanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear tag'), actions: const [UserMenuButton()]),
    );
  }
}
