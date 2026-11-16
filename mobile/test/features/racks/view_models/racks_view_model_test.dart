import 'package:flutter_test/flutter_test.dart';
import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/rack_summary.dart';
import 'package:rack_monitoring/features/racks/view_models/racks_view_model.dart';

RackSummary summary(String name, RackStatus status, {String location = 'Pasillo A', DateTime? ts}) => RackSummary(
  rack: Rack(id: name, name: name, location: location),
  status: status,
  latest: ts == null ? null : (ts: ts, tilt: 0, vibrationRms: 0),
);

List<String> namesOf(List<RackSummary> summaries) => [for (final summary in summaries) summary.rack.name];

void main() {
  final summaries = [
    summary('B-01', RackStatus.ok),
    summary('C-02', RackStatus.offline, location: 'Pasillo C'),
    summary('b-02', RackStatus.alarm),
    summary('A-01', RackStatus.ok),
    summary('A-02', RackStatus.warning),
  ];

  test('sorts by urgency and then by name', () {
    expect(namesOf(sortRacksByUrgency(summaries)), ['b-02', 'A-02', 'C-02', 'A-01', 'B-01']);
  });

  test('filters by name or location, ignoring case and spaces', () {
    expect(namesOf(filterRacks(summaries, search: ' b-0 ')), ['B-01', 'b-02']);
    expect(namesOf(filterRacks(summaries, search: 'pasillo c')), ['C-02']);
  });

  test('filters by status together with the search', () {
    expect(namesOf(filterRacks(summaries, search: 'a-', status: RackStatus.ok)), ['A-01']);
  });

  test('takes the newest reading as the last update', () {
    final newest = DateTime(2026, 11, 15, 10, 5);
    final readings = [
      summary('A-01', RackStatus.ok, ts: DateTime(2026, 11, 15, 10)),
      summary('A-02', RackStatus.ok, ts: newest),
      summary('C-02', RackStatus.offline),
    ];

    expect(lastUpdate(readings), newest);
    expect(lastUpdate([summary('C-02', RackStatus.offline)]), isNull);
  });
}
