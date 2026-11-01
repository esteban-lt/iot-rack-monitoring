import { useQuery } from '@tanstack/react-query'
import { getRackAction } from '../actions/get-rack-action';
import { liveRefetchInterval } from '@/lib/live-refetch-interval';

export const useRack = (rackId: string) => {
  const query = useQuery({
    queryKey: ['rack', rackId],
    queryFn: () => getRackAction(rackId),
    staleTime: 1000 * 30,
    refetchInterval: liveRefetchInterval,
  });

  return query;
}
