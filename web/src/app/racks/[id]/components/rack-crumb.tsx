import { useParams } from 'react-router';
import { useRack } from '../../hooks/use-rack';

export const RackCrumb = () => {
  const { id = '' } = useParams();
  const { data } = useRack(id);

  return data?.rack.name ?? 'Rack';
}
