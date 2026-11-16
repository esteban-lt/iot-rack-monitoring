import 'package:flutter/material.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_sheet.dart';

class UserMenuButton extends StatelessWidget {
  const UserMenuButton({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.account_circle_outlined),
      tooltip: 'Cuenta',
      onPressed: () => showModalBottomSheet<void>(
        context: context,
        showDragHandle: true,
        builder: (context) => const UserMenuSheet(),
      ),
    );
  }
}
