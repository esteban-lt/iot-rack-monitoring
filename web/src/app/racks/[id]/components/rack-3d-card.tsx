import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Rack3DCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista 3D del rack</CardTitle>
        <CardDescription>Próximamente</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Aquí irá el componente 3D.
      </CardContent>
    </Card>
  );
}
