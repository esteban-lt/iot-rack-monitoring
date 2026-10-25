import { columnsWithoutRack } from '@/app/alarms/components/data-table/columns';
import { DataTable } from '@/app/alarms/components/data-table/data-table';
import { useAlarms } from '@/app/alarms/hooks/use-alarms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  nodeId: string;
}

export const AlarmsCard = ({ nodeId }: Props) => {
  const { data } = useAlarms({ filters: { severity: 'all', status: 'all', nodeId }, pageSize: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alarmas recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columnsWithoutRack} data={data?.alarms ?? []} />
      </CardContent>
    </Card>
  );
}
