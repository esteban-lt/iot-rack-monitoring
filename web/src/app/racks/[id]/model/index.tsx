import { useParams } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { RackLoadError } from '../../components/rack-load-error';
import { useRack } from '../../hooks/use-rack';
import { useRackModel } from '../../hooks/use-rack-model';
import { useThresholds } from '../../hooks/use-thresholds';
import { ModelEditor } from './components/model-editor';

const Index = () => {
  const { id = '' } = useParams();
  const { data: summary, isError: isRackError } = useRack(id);
  const { data: config, isError: isModelError } = useRackModel(id);
  const { data: thresholds } = useThresholds(summary?.rack.nodeId);

  if (isRackError || isModelError) return <RackLoadError title="No se pudo cargar el modelo del rack" />;
  if (!summary || !config) return <Skeleton className="h-[70vh] rounded-xl" />;

  return <ModelEditor rackId={id} rackName={summary.rack.name} initialConfig={config} alarmDeg={thresholds?.tiltAlarmDeg} />;
}

export default Index;
