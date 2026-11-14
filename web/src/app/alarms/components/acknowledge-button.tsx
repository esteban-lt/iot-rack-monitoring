import { Button } from '@/components/ui/button';
import { useAcknowledgeAlarms } from '../hooks/use-acknowledge-alarms';

interface Props {
  alarmId: string;
}

export const AcknowledgeButton = ({ alarmId }: Props) => {
  const { mutate, isPending } = useAcknowledgeAlarms();

  return (
    <Button variant="outline" disabled={isPending} onClick={() => mutate([alarmId])}>
      {isPending ? 'Reconociendo...' : 'Reconocer'}
    </Button>
  );
}
