import { Button } from '@/components/ui/button';
import { useAcknowledgeAlarm } from '../hooks/use-acknowledge-alarm';

interface Props {
  alarmId: string;
}

export const AcknowledgeButton = ({ alarmId }: Props) => {
  const { mutate, isPending } = useAcknowledgeAlarm();

  return (
    <Button variant="outline" disabled={isPending} onClick={() => mutate(alarmId)}>
      {isPending ? 'Reconociendo...' : 'Reconocer'}
    </Button>
  );
}
