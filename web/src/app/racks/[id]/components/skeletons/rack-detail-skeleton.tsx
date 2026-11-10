import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-72 w-full" />
    </CardContent>
  </Card>
);

export const RackDetailSkeleton = () => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Skeleton className="h-96 rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>

      <Skeleton className="h-8 w-48" />
      <ChartSkeleton />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </>
  );
}
