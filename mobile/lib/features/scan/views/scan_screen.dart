import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rack_monitoring/core/router/app_router.dart';
import 'package:rack_monitoring/features/auth/views/widgets/user_menu_button.dart';
import 'package:rack_monitoring/features/scan/view_models/scan_view_model.dart';
import 'package:rack_monitoring/features/scan/views/widgets/scan_zone.dart';
import 'package:rack_monitoring/shared/widgets/message_state.dart';

class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({super.key});

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends ConsumerState<ScanScreen> {
  bool _isVisible = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // The tabs stay mounted; a hidden tab has its tickers disabled
    final isVisible = TickerMode.valuesOf(context).enabled;
    if (isVisible == _isVisible) return;
    _isVisible = isVisible;

    final scan = ref.read(scanViewModelProvider.notifier);
    Future.microtask(isVisible ? scan.open : scan.close);
  }

  void _onStateChanged(ScanState? previous, ScanState next) {
    if (next is ScanFound) {
      HapticFeedback.mediumImpact();
      context.go(AppRoutes.rackDetail(next.rackId));
    } else if (next is ScanUnknownTag) {
      HapticFeedback.heavyImpact();
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(scanViewModelProvider, _onStateChanged);
    final state = ref.watch(scanViewModelProvider);
    final scan = ref.read(scanViewModelProvider.notifier);

    final viewRacksButton = OutlinedButton(
      onPressed: () => context.go(AppRoutes.racks),
      child: const Text('Ver lista de racks'),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Escanear tag'), actions: const [UserMenuButton()]),
      body: switch (state) {
        ScanChecking() || ScanFound() => const Center(child: CircularProgressIndicator()),
        ScanUnsupported() => MessageState(
          icon: Icons.nfc,
          title: 'Este dispositivo no tiene NFC',
          description: 'Busca el rack en la lista para ver su detalle.',
          action: viewRacksButton,
        ),
        ScanDisabled() => MessageState(
          icon: Icons.nfc,
          title: 'El NFC está desactivado',
          description: 'Actívalo en los ajustes del celular para leer el tag del rack.',
          action: Column(
            spacing: 8,
            children: [
              FilledButton(onPressed: scan.openNfcSettings, child: const Text('Abrir ajustes')),
              TextButton(onPressed: scan.open, child: const Text('Comprobar de nuevo')),
            ],
          ),
        ),
        ScanReady() || ScanWaiting() => _ScanLayout(
          zone: ScanZone(label: state is ScanWaiting ? 'Esperando tag...' : 'Listo para leer'),
          detail: const Text('Al leerlo, se abrirá el detalle de ese rack.', textAlign: TextAlign.center),
          actions: [if (state is ScanReady) FilledButton(onPressed: scan.scan, child: const Text('Escanear tag'))],
        ),
        ScanUnknownTag(:final uid) => _ScanLayout(
          zone: const ScanZone(label: 'Tag no reconocido', isError: true),
          detail: Card.outlined(
            child: ListTile(
              title: const Text('Este tag no está asociado a ningún rack'),
              subtitle: Text('UID leído: $uid\nVerifica que sea el tag del rack o pide que lo registren.'),
              trailing: IconButton(
                icon: const Icon(Icons.copy),
                tooltip: 'Copiar UID',
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: uid));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('UID copiado')));
                },
              ),
            ),
          ),
          actions: [
            FilledButton(onPressed: scan.scan, child: const Text('Intentar de nuevo')),
            viewRacksButton,
          ],
        ),
      },
    );
  }
}

class _ScanLayout extends StatelessWidget {
  const _ScanLayout({required this.zone, required this.detail, required this.actions});

  final Widget zone;
  final Widget detail;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: [
          Text('Acerca el celular al tag del rack', style: theme.textTheme.titleLarge, textAlign: TextAlign.center),
          Text(
            'Apoya la parte trasera del teléfono sobre el tag NFC pegado en el rack y mantenlo quieto un momento.',
            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
          Center(child: zone),
          detail,
          ...actions,
        ],
      ),
    );
  }
}
