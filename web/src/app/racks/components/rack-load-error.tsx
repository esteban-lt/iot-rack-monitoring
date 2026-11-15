import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

export const RackLoadError = ({ title }: { title: string }) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>Puede que el rack ya no exista o que no haya conexión con ThingsBoard.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" nativeButton={false} render={<Link to="/racks" />}>Volver a racks</Button>
      </EmptyContent>
    </Empty>
  );
}
