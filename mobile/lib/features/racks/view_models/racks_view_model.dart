import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/data/repositories/rack_repository.dart';

final rackSummariesProvider = StreamProvider.autoDispose<List<RackSummary>>(
  (ref) => ref.watch(rackRepositoryProvider).watchRackSummaries(),
);

// Most urgent first; offline goes before ok because it needs a look
const _urgency = [RackStatus.alarm, RackStatus.warning, RackStatus.offline, RackStatus.ok];

List<RackSummary> sortRacksByUrgency(List<RackSummary> summaries) => [...summaries]
  ..sort((a, b) {
    final byStatus = _urgency.indexOf(a.status).compareTo(_urgency.indexOf(b.status));
    return byStatus != 0 ? byStatus : a.rack.name.toLowerCase().compareTo(b.rack.name.toLowerCase());
  });

// A null status keeps every rack
List<RackSummary> filterRacks(List<RackSummary> summaries, {required String search, RackStatus? status}) {
  final term = search.trim().toLowerCase();

  return [
    for (final summary in summaries)
      if (status == null || summary.status == status)
        if ([summary.rack.name, summary.rack.location].any((text) => text.toLowerCase().contains(term))) summary,
  ];
}

DateTime? lastUpdate(List<RackSummary> summaries) => summaries
    .map((summary) => summary.latest?.ts)
    .nonNulls
    .fold<DateTime?>(null, (newest, ts) => newest == null || ts.isAfter(newest) ? ts : newest);
