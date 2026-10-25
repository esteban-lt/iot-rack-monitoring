import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatDate } from '@/lib/utils';
import type { HistoryRange, TelemetryPoint } from '../../interfaces/rack-history';
import { formatTick } from '../utils';
import { ChartCard } from './chart-card';

interface Props {
  data: TelemetryPoint[];
  range: HistoryRange;
}

const chartConfig = {
  vibRms: { label: 'Vibración (g)', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export const VibrationChart = ({ data, range }: Props) => {
  return (
    <ChartCard title="Vibración (g, RMS)" isEmpty={!data.length}>
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <LineChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="ts" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(ts) => formatTick(ts, range)} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(ts) => formatDate(Number(ts))} />} />
          <Line dataKey="vibRms" stroke="var(--color-vibRms)" dot={false} />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}
