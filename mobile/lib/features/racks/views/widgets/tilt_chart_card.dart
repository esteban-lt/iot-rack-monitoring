import 'dart:math';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/theme/status_colors.dart';
import 'package:rack_monitoring/core/utils/date_format.dart';
import 'package:rack_monitoring/data/models/history_range.dart';
import 'package:rack_monitoring/data/models/rack_status.dart';
import 'package:rack_monitoring/data/models/thresholds.dart';
import 'package:rack_monitoring/features/racks/view_models/rack_detail_view_model.dart';

class TiltChartCard extends ConsumerStatefulWidget {
  const TiltChartCard({super.key, required this.nodeId, this.thresholds});

  final String nodeId;
  final Thresholds? thresholds;

  @override
  ConsumerState<TiltChartCard> createState() => _TiltChartCardState();
}

class _TiltChartCardState extends ConsumerState<TiltChartCard> {
  HistoryRange _range = HistoryRange.twoHours;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final history = ref.watch(tiltHistoryProvider((nodeId: widget.nodeId, range: _range)));

    return Card.outlined(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 16,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Inclinación', style: theme.textTheme.titleMedium),
                SegmentedButton<HistoryRange>(
                  segments: [
                    for (final range in HistoryRange.values) ButtonSegment(value: range, label: Text(range.label)),
                  ],
                  selected: {_range},
                  showSelectedIcon: false,
                  style: const ButtonStyle(visualDensity: VisualDensity.compact),
                  onSelectionChanged: (selection) => setState(() => _range = selection.first),
                ),
              ],
            ),
            SizedBox(
              height: 200,
              child: switch (history) {
                AsyncData(:final value) when value.isEmpty => const Center(child: Text('Sin datos en este periodo')),
                AsyncData(:final value) => _TiltChart(points: value, range: _range, thresholds: widget.thresholds),
                AsyncError() => const Center(child: Text('No se pudo cargar el historial')),
                AsyncLoading() => const Center(child: CircularProgressIndicator()),
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _TiltChart extends StatelessWidget {
  const _TiltChart({required this.points, required this.range, this.thresholds});

  final List<TiltPoint> points;
  final HistoryRange range;
  final Thresholds? thresholds;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColors = theme.extension<StatusColors>()!;
    final labelStyle = theme.textTheme.labelSmall!.copyWith(color: theme.colorScheme.onSurfaceVariant);
    final end = DateTime.now();
    final highest = [...points.map((point) => point.tilt), thresholds?.tiltAlarmDeg ?? 0].reduce(max);

    HorizontalLine thresholdLine(double value, String label, RackStatus status) => HorizontalLine(
      y: value,
      color: statusColors.of(status).color,
      strokeWidth: 1,
      dashArray: [6, 4],
      label: HorizontalLineLabel(
        show: true,
        alignment: Alignment.topRight,
        style: labelStyle.copyWith(color: statusColors.of(status).color),
        labelResolver: (_) => label,
      ),
    );

    return LineChart(
      LineChartData(
        minX: end.subtract(range.duration).millisecondsSinceEpoch.toDouble(),
        maxX: end.millisecondsSinceEpoch.toDouble(),
        minY: 0,
        maxY: (highest * 1.25).ceilToDouble().clamp(1, double.infinity),
        borderData: FlBorderData(show: false),
        gridData: const FlGridData(drawVerticalLine: false),
        lineBarsData: [
          LineChartBarData(
            spots: [for (final point in points) FlSpot(point.ts.millisecondsSinceEpoch.toDouble(), point.tilt)],
            color: theme.colorScheme.primary,
            barWidth: 2,
            dotData: const FlDotData(show: false),
          ),
        ],
        extraLinesData: ExtraLinesData(
          horizontalLines: [
            if (thresholds case final thresholds? when thresholds.tiltAlarmDeg > 0) ...[
              thresholdLine(thresholds.tiltWarnDeg, 'Advertencia', RackStatus.warning),
              thresholdLine(thresholds.tiltAlarmDeg, 'Alarma', RackStatus.alarm),
            ],
          ],
        ),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(),
          rightTitles: const AxisTitles(),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 32,
              maxIncluded: false,
              getTitlesWidget: (value, meta) => SideTitleWidget(
                meta: meta,
                child: Text('${value.toInt()}°', style: labelStyle),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: range.duration.inMilliseconds / 4,
              getTitlesWidget: (value, meta) {
                // The edges would be cut by the card
                if (value == meta.min || value == meta.max) return const SizedBox.shrink();

                final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
                final label = range == HistoryRange.week ? formatDay(date) : formatTime(date);
                return SideTitleWidget(
                  meta: meta,
                  child: Text(label, style: labelStyle),
                );
              },
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => theme.colorScheme.inverseSurface,
            getTooltipItems: (spots) => [
              for (final spot in spots)
                LineTooltipItem(
                  '${spot.y.toStringAsFixed(1)}°\n${formatDateTime(DateTime.fromMillisecondsSinceEpoch(spot.x.toInt()))}',
                  theme.textTheme.labelMedium!.copyWith(color: theme.colorScheme.onInverseSurface),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
