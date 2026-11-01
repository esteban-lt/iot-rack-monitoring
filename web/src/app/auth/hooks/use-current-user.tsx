import { useQuery } from '@tanstack/react-query'
import { getCurrentUserAction } from '../actions/get-current-user-action';

export const useCurrentUser = () => {
  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUserAction,
    staleTime: Infinity,
  });

  return query;
}
