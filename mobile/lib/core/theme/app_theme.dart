import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/theme/status_colors.dart';

const _seedColor = Color(0xFF3F5F90);

ThemeData buildTheme(Brightness brightness) {
  final colorScheme = ColorScheme.fromSeed(seedColor: _seedColor, brightness: brightness);

  return ThemeData(colorScheme: colorScheme, extensions: [StatusColors.from(colorScheme)]);
}
