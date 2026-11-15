import { useQuery } from '@tanstack/react-query'
import { getRacksAction } from '../actions/get-racks-action';

interface Params {
  pageSize?: number;
  page?: number;
}

export const racksQueryKey = ({ pageSize = 50, page = 0 }: Params = {}) => ['racks', { pageSize, page }];

export const useRacks = ({ pageSize = 50, page = 0 }: Params = {}) => {
  const query = useQuery({
    queryKey: racksQueryKey({ pageSize, page }),
    queryFn: () => getRacksAction(pageSize, page),
    staleTime: 1000 * 60 * 30,
  });

  return query;
}
