import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  title: string;
  isEmpty: boolean;
  children: ReactNode;
}

export const ChartCard = ({ title, isEmpty, children }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? <p className="text-sm text-muted-foreground">Sin datos en este periodo.</p> : children}
      </CardContent>
    </Card>
  );
}
