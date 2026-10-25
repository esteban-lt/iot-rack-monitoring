import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Thresholds } from '@/interfaces/thresholds';
import { updateThresholdsAction } from '../actions/update-thresholds-action';

export const useUpdateThresholds = (nodeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (thresholds: Thresholds) => updateThresholdsAction(nodeId, thresholds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thresholds', nodeId] }),
  });

  return mutation;
}
