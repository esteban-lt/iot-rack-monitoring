class Thresholds {
  const Thresholds({required this.tiltWarnDeg, required this.tiltAlarmDeg, required this.impactG});

  factory Thresholds.fromAttributes(Map<String, dynamic> attributes) => Thresholds(
    tiltWarnDeg: (attributes['tilt_warn_deg'] as num? ?? 0).toDouble(),
    tiltAlarmDeg: (attributes['tilt_alarm_deg'] as num? ?? 0).toDouble(),
    impactG: (attributes['impact_g'] as num? ?? 0).toDouble(),
  );

  static const attributeKeys = ['tilt_warn_deg', 'tilt_alarm_deg', 'impact_g'];

  final double tiltWarnDeg;
  final double tiltAlarmDeg;
  final double impactG;
}
