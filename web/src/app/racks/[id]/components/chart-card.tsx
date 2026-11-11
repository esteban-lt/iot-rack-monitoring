import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  title: string;
  isEmpty: boolean;
  isLoading: boolean;
  children: ReactNode;
}

export const ChartCard = ({ title, isEmpty, isLoading, children }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : isEmpty ? (
          <p className="text-sm text-muted-foreground">Sin datos en este periodo.</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
