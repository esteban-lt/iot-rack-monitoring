enum RackStatus {
  ok('Normal'),
  warning('Advertencia'),
  alarm('Alarma'),
  offline('Sin conexión');

  const RackStatus(this.label);

  final String label;
}
