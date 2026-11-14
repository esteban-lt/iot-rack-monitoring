import { Link } from 'react-router';
import { useDevices } from '@/app/devices/hooks/use-devices';
import { useLiveNodes } from '@/app/devices/hooks/use-live-nodes';
import { RelativeTime } from '@/components/relative-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const UnassignedNodesCard = () => {
  const { data = [], isLoading } = useDevices();
  useLiveNodes(['devices', { pageSize: 50, page: 0 }], data.map(({ node }) => node.id));
  const nodes = data.filter(({ node }) => !node.rackId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nodos sin rack asignado</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/devices" />}>Ver nodos</Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {isLoading && <Skeleton className="h-16" />}
        {!isLoading && !nodes.length && <p className="text-muted-foreground">Todos los nodos tienen un rack asignado.</p>}
        {nodes.map(({ node, latest }) => (
          <div key={node.id} className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium">{node.name}</p>
              <p className="text-xs text-muted-foreground">
                {latest && `Señal ${latest.rssi} dBm · `}
                {node.lastActivityTs ? <>último dato <RelativeTime ts={node.lastActivityTs} /></> : 'sin datos'}
              </p>
            </div>
            <Badge variant={node.isActive ? 'normal' : 'outline'}>{node.isActive ? 'En línea' : 'Sin conexión'}</Badge>
          </div>
        ))}
        {nodes.length > 0 && (
          <p className="text-xs text-muted-foreground">Acerca cada nodo a la tarjeta RFID de su rack para asignarlo.</p>
        )}
      </CardContent>
    </Card>
  );
}
