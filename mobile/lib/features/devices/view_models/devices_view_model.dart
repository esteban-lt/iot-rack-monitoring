import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/node_summary.dart';
import 'package:rack_monitoring/data/repositories/rack_repository.dart';

final nodeSummariesProvider = StreamProvider.autoDispose<List<NodeSummary>>(
  (ref) => ref.watch(rackRepositoryProvider).watchNodeSummaries(),
);

enum NodeFilter {
  online('En línea'),
  offline('Sin conexión'),
  unassigned('Sin asignar');

  const NodeFilter(this.label);

  final String label;

  bool matches(NodeSummary node) => switch (this) {
    online => node.isOnline,
    offline => !node.isOnline,
    unassigned => node.rackId == null,
  };
}

// A null filter keeps every node; the search looks at the name, MAC and IP
List<NodeSummary> filterNodes(List<NodeSummary> nodes, {required String search, NodeFilter? filter}) {
  final term = search.trim().toLowerCase();

  return [
    for (final node in nodes)
      if (filter?.matches(node) ?? true)
        if ([node.name, node.mac, node.ip].nonNulls.any((text) => text.toLowerCase().contains(term))) node,
  ]..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
}
