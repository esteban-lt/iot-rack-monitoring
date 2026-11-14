import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAlarmsAction } from '../actions/delete-alarms-action';

export const useDeleteAlarms = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteAlarmsAction,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alarms'] }),
  });

  return mutation;
}
