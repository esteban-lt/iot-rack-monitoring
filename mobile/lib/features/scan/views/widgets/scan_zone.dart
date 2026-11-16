import 'package:flutter/material.dart';

// Big square that shows what the reader is doing
class ScanZone extends StatefulWidget {
  const ScanZone({super.key, required this.label, this.isError = false});

  final String label;
  final bool isError;

  @override
  State<ScanZone> createState() => _ScanZoneState();
}

class _ScanZoneState extends State<ScanZone> with SingleTickerProviderStateMixin {
  late final _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));

  @override
  void initState() {
    super.initState();
    _syncPulse();
  }

  @override
  void didUpdateWidget(ScanZone oldWidget) {
    super.didUpdateWidget(oldWidget);
    _syncPulse();
  }

  // The icon only pulses while waiting for a tag
  void _syncPulse() => widget.isError ? _pulse.stop() : _pulse.repeat(reverse: true);

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final foreground = widget.isError ? colors.onErrorContainer : colors.onSurfaceVariant;

    return SizedBox.square(
      dimension: 240,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: widget.isError ? colors.errorContainer : colors.surfaceContainerHigh,
          border: Border.all(color: widget.isError ? colors.error : colors.outlineVariant, width: 2),
          borderRadius: BorderRadius.circular(28),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          spacing: 16,
          children: [
            ScaleTransition(
              scale: Tween<double>(begin: 1, end: 1.15).animate(_pulse),
              child: Icon(widget.isError ? Icons.error_outline : Icons.nfc, size: 72, color: foreground),
            ),
            Text(widget.label, style: theme.textTheme.titleMedium?.copyWith(color: foreground)),
          ],
        ),
      ),
    );
  }
}
