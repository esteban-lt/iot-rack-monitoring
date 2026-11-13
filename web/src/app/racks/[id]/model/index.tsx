import { useParams } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { useRack } from '../../hooks/use-rack';
import { useRackModel } from '../../hooks/use-rack-model';
import { ModelEditor } from './components/model-editor';

const Index = () => {
  const { id = '' } = useParams();
  const { data: summary, isError: isRackError } = useRack(id);
  const { data: config, isError: isModelError } = useRackModel(id);

  if (isRackError || isModelError) return <p>No se pudo cargar el modelo del rack.</p>;
  if (!summary || !config) return <Skeleton className="h-[70vh] rounded-xl" />;

  return <ModelEditor rackId={id} rackName={summary.rack.name} initialConfig={config} />;
}

export default Index;
