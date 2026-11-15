import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { ImpactEvent } from '@/interfaces/impact-event';
import type { Thresholds } from '@/interfaces/thresholds';
import type { HistoryRange } from '../../interfaces/rack-history';
import { formatTick, tooltipTime } from '../utils';
import { ChartCard } from './chart-card';

interface Props {
  data: ImpactEvent[];
  range: HistoryRange;
  thresholds?: Thresholds;
  isLoading: boolean;
}

const chartConfig = {
  impactG: { label: 'Impacto', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export const ImpactsChart = ({ data, range, thresholds, isLoading }: Props) => {
  return (
    <ChartCard title="Impactos (g)" isEmpty={!data.length} isLoading={isLoading}>
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="ts" tickFormatter={(ts) => formatTick(ts, range)} />
          <YAxis />
          {thresholds && (
            <ReferenceLine y={thresholds.impactG} stroke="var(--destructive)" strokeDasharray="4 4" ifOverflow="extendDomain" label={{ value: 'Umbral', position: 'insideBottomRight' }} />
          )}
          <ChartTooltip content={<ChartTooltipContent labelFormatter={tooltipTime} />} />
          <Bar dataKey="impactG" fill="var(--color-impactG)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
