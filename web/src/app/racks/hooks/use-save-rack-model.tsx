import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveRackModelAction } from '../actions/save-rack-model-action';
import type { RackModelConfig } from '../schemas/rack-model-schema';

export const useSaveRackModel = (rackId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (config: RackModelConfig) => saveRackModelAction(rackId, config),
    onSuccess: (saved) => queryClient.setQueryData(['rack-model', rackId], saved),
  });

  return mutation;
}
