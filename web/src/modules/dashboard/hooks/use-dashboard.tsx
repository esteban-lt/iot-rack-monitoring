import { useQuery } from '@tanstack/react-query'
import { getDashboardAction } from '../actions/get-dashboard-action';

export const useDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardAction,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  return query;
}
