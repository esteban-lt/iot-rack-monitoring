import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getRackHistoryAction } from '../actions/get-rack-history-action';
import type { HistoryRange } from '../interfaces/rack-history';

export const useRackHistory = (nodeId: string | undefined, range: HistoryRange) => {
  const query = useQuery({
    queryKey: ['rack-history', nodeId, range],
    queryFn: () => getRackHistoryAction(nodeId!, range),
    enabled: !!nodeId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  return query;
}
