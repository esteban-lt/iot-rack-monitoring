import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAlarmsAction } from '../actions/get-alarms-action';
import type { AlarmFilters } from '../interfaces/alarm-filters';

interface Params {
  filters: AlarmFilters;
  pageSize?: number;
  page?: number;
}

export const useAlarms = ({ filters, pageSize = 10, page = 0 }: Params) => {
  const query = useQuery({
    queryKey: ['alarms', filters, { pageSize, page }],
    queryFn: () => getAlarmsAction(filters, pageSize, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  return query;
}
