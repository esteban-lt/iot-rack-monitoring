import 'package:rack_monitoring/data/models/rack.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';

typedef TelemetrySample = ({DateTime ts, double tilt, double vibrationRms});
typedef ImpactEvent = ({DateTime ts, double impactG});

class RackSummary {
  const RackSummary({required this.rack, required this.status, this.latest, this.lastSeen, this.lastImpact});

  final Rack rack;
  final RackStatus status;

  // Current reading; missing while the rack is offline
  final TelemetrySample? latest;

  // Last time the node sent data, kept while offline
  final DateTime? lastSeen;
  final ImpactEvent? lastImpact;
}
