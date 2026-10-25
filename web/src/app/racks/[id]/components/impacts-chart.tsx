import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { ImpactEvent } from '@/interfaces/impact-event';
import type { Thresholds } from '@/interfaces/thresholds';
import { formatDate } from '@/lib/utils';
import type { HistoryRange } from '../../interfaces/rack-history';
import { formatTick } from '../utils';
import { ChartCard } from './chart-card';

interface Props {
  data: ImpactEvent[];
  range: HistoryRange;
  thresholds?: Thresholds;
}

const chartConfig = {
  impactG: { label: 'Impacto (g)', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export const ImpactsChart = ({ data, range, thresholds }: Props) => {
  return (
    <ChartCard title="Impactos (g)" isEmpty={!data.length}>
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="ts" tickFormatter={(ts) => formatTick(ts, range)} />
          <YAxis />
          {thresholds && (
            <ReferenceLine y={thresholds.impactG} stroke="var(--destructive)" strokeDasharray="4 4" ifOverflow="extendDomain" label="Umbral" />
          )}
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(ts) => formatDate(Number(ts))} />} />
          <Bar dataKey="impactG" fill="var(--color-impactG)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
