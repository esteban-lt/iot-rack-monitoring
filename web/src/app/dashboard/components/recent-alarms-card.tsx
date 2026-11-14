import { Link } from 'react-router';
import { columns } from '@/app/alarms/components/data-table/columns';
import { DataTable } from '@/app/alarms/components/data-table/data-table';
import { useAlarms } from '@/app/alarms/hooks/use-alarms';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RecentAlarmsCard = () => {
  const { data, isLoading } = useAlarms({ filters: { severity: 'all', status: 'all', nodeId: 'all' }, pageSize: 5 });

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Alarmas recientes</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/alarms" />}>Ver todas</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? <TableSkeleton columns={6} /> : <DataTable columns={columns} data={data?.alarms ?? []} />}
      </CardContent>
    </Card>
  );
}
