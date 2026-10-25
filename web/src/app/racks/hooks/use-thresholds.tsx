import { useQuery } from '@tanstack/react-query'
import { getThresholdsAction } from '../actions/get-thresholds-action';

export const useThresholds = (nodeId: string | undefined) => {
  const query = useQuery({
    queryKey: ['thresholds', nodeId],
    queryFn: () => getThresholdsAction(nodeId!),
    enabled: !!nodeId,
    staleTime: 1000 * 60,
  });

  return query;
}
