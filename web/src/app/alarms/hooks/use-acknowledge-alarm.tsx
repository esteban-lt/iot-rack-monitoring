import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acknowledgeAlarmAction } from '../actions/acknowledge-alarm-action';

export const useAcknowledgeAlarm = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: acknowledgeAlarmAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alarms'] }),
  });

  return mutation;
}
