import 'package:rack_monitoring/data/models/rack_status.dart';

// The tone picks the badge color
enum AlarmSeverity {
  critical('Crítica', RackStatus.alarm),
  major('Mayor', RackStatus.warning),
  minor('Menor', RackStatus.offline),
  warning('Advertencia', RackStatus.warning),
  indeterminate('Indeterminada', RackStatus.offline);

  const AlarmSeverity(this.label, this.tone);

  final String label;
  final RackStatus tone;
}

class Alarm {
  const Alarm({
    required this.id,
    required this.nodeId,
    required this.type,
    required this.severity,
    required this.createdAt,
    required this.isActive,
    required this.isAcknowledged,
  });

  factory Alarm.fromJson(Map<String, dynamic> json) {
    // ACTIVE_UNACK, ACTIVE_ACK, CLEARED_UNACK or CLEARED_ACK
    final status = json['status'] as String;
    final severity = (json['severity'] as String).toLowerCase();

    return Alarm(
      id: (json['id'] as Map<String, dynamic>)['id'] as String,
      nodeId: (json['originator'] as Map<String, dynamic>)['id'] as String,
      type: json['type'] as String,
      severity: AlarmSeverity.values.firstWhere(
        (value) => value.name == severity,
        orElse: () => AlarmSeverity.indeterminate,
      ),
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['createdTime'] as int),
      isActive: status.startsWith('ACTIVE'),
      isAcknowledged: status.endsWith('_ACK'),
    );
  }

  final String id;
  final String nodeId;
  final String type;
  final AlarmSeverity severity;
  final DateTime createdAt;
  final bool isActive;
  final bool isAcknowledged;
}
