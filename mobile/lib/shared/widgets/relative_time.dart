import 'dart:async';

import 'package:flutter/material.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';

// Text like "hace 5 s" that keeps itself up to date
class RelativeTime extends StatefulWidget {
  const RelativeTime(this.date, {super.key, this.prefix = '', this.style});

  final DateTime date;
  final String prefix;
  final TextStyle? style;

  @override
  State<RelativeTime> createState() => _RelativeTimeState();
}

class _RelativeTimeState extends State<RelativeTime> {
  late final Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => setState(() {}));
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text('${widget.prefix}${formatRelativeTime(widget.date, DateTime.now())}', style: widget.style);
  }
}
