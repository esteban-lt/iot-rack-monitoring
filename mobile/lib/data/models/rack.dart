class Rack {
  const Rack({required this.id, required this.name, required this.location, this.rfidUid, this.nodeId, this.nodeName});

  final String id;
  final String name;
  final String location;
  final String? rfidUid;
  final String? nodeId;
  final String? nodeName;
}
