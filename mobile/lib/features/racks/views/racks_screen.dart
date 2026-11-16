import 'package:flutter/material.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';

class RacksScreen extends StatelessWidget {
  const RacksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Racks'), actions: const [UserMenuButton()]),
    );
  }
}
