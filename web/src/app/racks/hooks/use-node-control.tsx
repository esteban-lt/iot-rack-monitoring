import { useQuery } from '@tanstack/react-query'
import { getNodeControlAction } from '../actions/get-node-control-action';

export const useNodeControl = (nodeId: string | undefined) => {
  const query = useQuery({
    queryKey: ['node-control', nodeId],
    queryFn: () => getNodeControlAction(nodeId!),
    enabled: !!nodeId,
    staleTime: 1000 * 30,
    refetchInterval: (query) => {
      const status = query.state.data?.calibrationStatus;
      return status === 'scheduled' || status === 'running' ? 1500 : false;
    },
  });

  return query;
}
