import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filters, type StatusFilter } from '../racks/components/filters';
import { useLiveRacks } from '../racks/hooks/use-live-racks';
import { filterRacks, sortRacks, type RackSort } from '../racks/utils';
import { RackGrid } from './components/rack-grid';
import { RecentAlarmsCard } from './components/recent-alarms-card';
import { DashboardSkeleton } from './components/skeletons/dashboard-skeleton';
import { Summary } from './components/summary';
import { UnassignedNodesCard } from './components/unassigned-nodes-card';
import { useDashboard } from './hooks/use-dashboard';

const sortItems: { value: RackSort; label: string }[] = [
  { value: 'critical', label: 'Estado más crítico' },
  { value: 'tilt', label: 'Mayor inclinación' },
  { value: 'name', label: 'Nombre' },
];

const Index = () => {
  const { data: summaries = [], isLoading, isError } = useDashboard();
  useLiveRacks(['dashboard'], summaries.flatMap(({ rack }) => rack.nodeId ?? []));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<RackSort>('critical');

  return (
    <>
      <PageHeader title="Dashboard" description="Estado en tiempo real de todos los racks." />
      {isLoading && <DashboardSkeleton />}
      {isError && <p>No se pudo cargar el dashboard.</p>}
      {!isLoading && !isError && (
        <>
          <Summary summaries={summaries} status={status} onStatusChange={setStatus} />

          <Filters
            summaries={summaries}
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
          >
            <Select items={sortItems} value={sort} onValueChange={(value) => setSort(value as RackSort)}>
              <SelectTrigger aria-label="Ordenar racks">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Filters>

          <RackGrid summaries={sortRacks(filterRacks(summaries, search, status), sort)} />
        </>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <RecentAlarmsCard />
        <UnassignedNodesCard />
      </div>
    </>
  );
}

export default Index;
