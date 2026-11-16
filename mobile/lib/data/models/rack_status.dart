enum RackStatus {
  ok('Normal'),
  warning('Advertencia'),
  alarm('Alarma'),
  offline('Sin conexión');

  const RackStatus(this.label);

  // The node reports ok, warning or alarm; a node that is not active counts as offline
  factory RackStatus.resolve(String? reported, {required bool isActive}) {
    if (!isActive) return offline;
    return values.firstWhere((status) => status.name == reported, orElse: () => offline);
  }

  final String label;
}
