import 'package:intl/intl.dart';

final _dateTimeFormat = DateFormat('dd/MM/yy HH:mm');
final _dateFormat = DateFormat('dd/MM/yy');
final _timeFormat = DateFormat('HH:mm');
final _dayFormat = DateFormat('dd/MM');

String formatDateTime(DateTime date) => _dateTimeFormat.format(date);

String formatDate(DateTime date) => _dateFormat.format(date);

String formatTime(DateTime date) => _timeFormat.format(date);

String formatDay(DateTime date) => _dayFormat.format(date);

// "hace 5 s", "hace 3 min", "hace 2 h", "hace 4 d"
String formatRelativeTime(DateTime date, DateTime now) {
  final elapsed = now.isAfter(date) ? now.difference(date) : Duration.zero;

  if (elapsed.inMinutes < 1) return 'hace ${elapsed.inSeconds} s';
  if (elapsed.inHours < 1) return 'hace ${elapsed.inMinutes} min';
  if (elapsed.inDays < 1) return 'hace ${elapsed.inHours} h';
  return 'hace ${elapsed.inDays} d';
}
