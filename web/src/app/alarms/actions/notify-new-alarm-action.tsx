import { Link } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { severityLabels } from '../utils';
import { getAlarmsAction } from './get-alarms-action';

// Shows the newest active alarm; with several new ones at once it mentions how many more there are
export const notifyNewAlarmAction = async (newCount: number) => {
  const { alarms } = await getAlarmsAction({ severity: 'all', status: 'active', nodeId: 'all' }, 1);
  const alarm = alarms[0];
  if (!alarm) return;

  const more = newCount > 1 ? ` (+${newCount - 1} más)` : '';

  toast.error(`Nueva alarma: ${alarm.type}${more}`, {
    description: `${alarm.rackName ? `Rack ${alarm.rackName}` : 'Rack sin asignar'} · ${severityLabels[alarm.severity]}`,
    duration: 10_000,
    action: alarm.rackId && (
      <Button size="sm" className="ml-auto" nativeButton={false} render={<Link to={`/racks/${alarm.rackId}`} />}>
        Ver rack
      </Button>
    ),
  });
}
