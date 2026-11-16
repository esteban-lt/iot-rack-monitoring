import 'package:flutter/material.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';

class AlarmsScreen extends StatelessWidget {
  const AlarmsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alertas'), actions: const [UserMenuButton()]),
    );
  }
}
