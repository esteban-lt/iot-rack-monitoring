typedef LatestValue = ({DateTime ts, String value});

// Latest values grouped by key type (TIME_SERIES, ATTRIBUTE...) and then by key
typedef LatestValues = Map<String, Map<String, LatestValue>>;

// An entity as returned by the entity data queries, over REST and over the socket
class EntityData {
  const EntityData({required this.id, required this.latest});

  factory EntityData.fromJson(Map<String, dynamic> json) {
    final latest = json['latest'] as Map<String, dynamic>? ?? {};

    return EntityData(
      id: (json['entityId'] as Map<String, dynamic>)['id'] as String,
      latest: {
        for (final MapEntry(key: type, value: values) in latest.entries)
          type: {
            for (final MapEntry(:key, :value) in (values as Map<String, dynamic>).entries)
              key: (ts: DateTime.fromMillisecondsSinceEpoch(value['ts'] as int), value: '${value['value'] ?? ''}'),
          },
      },
    );
  }

  final String id;
  final LatestValues latest;

  // ThingsBoard sends an empty value for keys the entity doesn't have
  String? valueOf(String type, String key) {
    final value = latest[type]?[key]?.value ?? '';
    return value.isEmpty ? null : value;
  }
}
