import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveRackAction } from '../actions/save-rack-action';
import type { RackFormValues } from '../schemas/rack-schema';

export const useSaveRack = (rackId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: RackFormValues) => saveRackAction(values, rackId),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return mutation;
}
