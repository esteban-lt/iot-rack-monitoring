// Each range averages its readings in intervals to keep the chart light
enum HistoryRange {
  twoHours('2 h', Duration(hours: 2), Duration(minutes: 2)),
  day('24 h', Duration(hours: 24), Duration(minutes: 15)),
  week('7 d', Duration(days: 7), Duration(hours: 1));

  const HistoryRange(this.label, this.duration, this.interval);

  final String label;
  final Duration duration;
  final Duration interval;
}

typedef TiltPoint = ({DateTime ts, double tilt});
