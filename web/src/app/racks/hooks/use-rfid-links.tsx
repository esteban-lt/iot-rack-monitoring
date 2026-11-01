import { useQuery } from '@tanstack/react-query'
import { getRfidLinksAction } from '../actions/get-rfid-links-action';

export const useRfidLinks = () => {
  const query = useQuery({
    queryKey: ['rfid-links'],
    queryFn: getRfidLinksAction,
    refetchInterval: 1000 * 5,
  });

  return query;
}
