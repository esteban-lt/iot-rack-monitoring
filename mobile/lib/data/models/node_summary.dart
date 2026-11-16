class NodeSummary {
  const NodeSummary({
    required this.id,
    required this.name,
    required this.isOnline,
    this.mac,
    this.ip,
    this.firmwareVersion,
    this.signalDbm,
    this.lastSeen,
    this.rackId,
    this.rackName,
  });

  final String id;
  final String name;
  final bool isOnline;
  final String? mac;
  final String? ip;
  final String? firmwareVersion;

  // WiFi signal of the last reading; missing while offline
  final int? signalDbm;
  final DateTime? lastSeen;

  // Rack whose tag the node read last; missing when another node took that rack
  final String? rackId;
  final String? rackName;
}
