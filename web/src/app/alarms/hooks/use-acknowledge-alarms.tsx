import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acknowledgeAlarmsAction } from '../actions/acknowledge-alarms-action';

export const useAcknowledgeAlarms = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: acknowledgeAlarmsAction,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alarms'] }),
  });

  return mutation;
}
