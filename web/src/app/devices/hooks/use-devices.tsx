import { useQuery } from '@tanstack/react-query'
import { getDevicesAction } from '../actions/get-devices-action';

interface Params {
  pageSize?: number;
  page?: number;
}

export const devicesQueryKey = ({ pageSize = 50, page = 0 }: Params = {}) => ['devices', { pageSize, page }];

export const useDevices = ({ pageSize = 50, page = 0 }: Params = {}) => {
  const query = useQuery({
    queryKey: devicesQueryKey({ pageSize, page }),
    queryFn: () => getDevicesAction(pageSize, page),
    staleTime: 1000 * 60 * 30,
  });

  return query;
}
