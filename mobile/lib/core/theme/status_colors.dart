import 'package:flutter/material.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';

typedef StatusColor = ({Color color, Color container, Color onContainer});

class StatusColors extends ThemeExtension<StatusColors> {
  const StatusColors(this._colors);

  factory StatusColors.from(ColorScheme scheme) {
    // Each status gets tones that match the app brightness
    StatusColor tones(Color seed) {
      final tonal = ColorScheme.fromSeed(seedColor: seed, brightness: scheme.brightness);
      return (color: tonal.primary, container: tonal.primaryContainer, onContainer: tonal.onPrimaryContainer);
    }

    return StatusColors({
      RackStatus.ok: tones(Colors.green),
      RackStatus.warning: tones(Colors.amber),
      RackStatus.alarm: (color: scheme.error, container: scheme.errorContainer, onContainer: scheme.onErrorContainer),
      RackStatus.offline: (
        color: scheme.outline,
        container: scheme.surfaceContainerHighest,
        onContainer: scheme.onSurfaceVariant,
      ),
    });
  }

  final Map<RackStatus, StatusColor> _colors;

  StatusColor of(RackStatus status) => _colors[status]!;

  @override
  StatusColors copyWith() => this;

  @override
  StatusColors lerp(StatusColors? other, double t) => t < 0.5 || other == null ? this : other;
}
