import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/core/theme/app_theme.dart';
import 'package:rack_monitoring/core/theme/status_colors.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';

void main() {
  for (final brightness in Brightness.values) {
    test('defines a different color for every status in ${brightness.name} theme', () {
      final statusColors = buildTheme(brightness).extension<StatusColors>()!;

      final colors = RackStatus.values.map((status) => statusColors.of(status).color).toSet();
      expect(colors, hasLength(RackStatus.values.length));
    });
  }
}
