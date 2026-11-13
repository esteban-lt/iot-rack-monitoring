import { useQuery } from '@tanstack/react-query'
import { getRackModelAction } from '../actions/get-rack-model-action';

export const useRackModel = (rackId: string) => {
  const query = useQuery({
    queryKey: ['rack-model', rackId],
    queryFn: () => getRackModelAction(rackId),
    staleTime: 1000 * 60 * 5,
  });

  return query;
}
