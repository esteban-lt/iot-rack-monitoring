import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/node_summary.dart';
import 'package:rack_monitoring/features/devices/view_models/devices_view_model.dart';

NodeSummary node(String name, {bool isOnline = true, String? rackId, String? mac, String? ip}) =>
    NodeSummary(id: name, name: name, isOnline: isOnline, rackId: rackId, mac: mac, ip: ip);

List<String> namesOf(List<NodeSummary> nodes) => [for (final node in nodes) node.name];

void main() {
  final nodes = [
    node('Nodo-02', isOnline: false, rackId: 'rack-2', mac: 'AA:BB:CC:00:00:02'),
    node('nodo-01', rackId: 'rack-1', ip: '192.168.1.20'),
    node('Nodo-03'),
  ];

  test('sorts by name', () {
    expect(namesOf(filterNodes(nodes, search: '')), ['nodo-01', 'Nodo-02', 'Nodo-03']);
  });

  test('searches the name, MAC and IP, ignoring case and spaces', () {
    expect(namesOf(filterNodes(nodes, search: ' aa:bb ')), ['Nodo-02']);
    expect(namesOf(filterNodes(nodes, search: '192.168')), ['nodo-01']);
    expect(namesOf(filterNodes(nodes, search: 'NODO-03')), ['Nodo-03']);
  });

  test('filters by connection or by missing rack', () {
    expect(namesOf(filterNodes(nodes, search: '', filter: NodeFilter.online)), ['nodo-01', 'Nodo-03']);
    expect(namesOf(filterNodes(nodes, search: '', filter: NodeFilter.offline)), ['Nodo-02']);
    expect(namesOf(filterNodes(nodes, search: '', filter: NodeFilter.unassigned)), ['Nodo-03']);
  });
}
