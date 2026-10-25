import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Thresholds } from '@/interfaces/thresholds';
import { formatDate } from '@/lib/utils';
import type { HistoryRange, TelemetryPoint } from '../../interfaces/rack-history';
import { formatTick } from '../utils';
import { ChartCard } from './chart-card';

interface Props {
  data: TelemetryPoint[];
  range: HistoryRange;
  thresholds?: Thresholds;
}

const chartConfig = {
  tilt: { label: 'Total', color: 'var(--chart-1)' },
  tiltX: { label: 'Eje X', color: 'var(--chart-2)' },
  tiltY: { label: 'Eje Y', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export const TiltChart = ({ data, range, thresholds }: Props) => {
  return (
    <ChartCard title="Inclinación (grados)" isEmpty={!data.length}>
      <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
        <LineChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="ts" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(ts) => formatTick(ts, range)} />
          <YAxis unit="°" />
          {thresholds && (
            <>
              <ReferenceLine y={thresholds.tiltWarnDeg} stroke="var(--chart-4)" strokeDasharray="4 4" ifOverflow="extendDomain" label="Advertencia" />
              <ReferenceLine y={thresholds.tiltAlarmDeg} stroke="var(--destructive)" strokeDasharray="4 4" ifOverflow="extendDomain" label="Alarma" />
            </>
          )}
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(ts) => formatDate(Number(ts))} />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line dataKey="tilt" stroke="var(--color-tilt)" dot={false} />
          <Line dataKey="tiltX" stroke="var(--color-tiltX)" dot={false} />
          <Line dataKey="tiltY" stroke="var(--color-tiltY)" dot={false} />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}
