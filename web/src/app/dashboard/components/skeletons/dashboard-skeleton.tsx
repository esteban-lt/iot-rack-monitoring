import { FiltersSkeleton } from '@/components/skeletons/filters-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { range } from '@/lib/utils';

export const DashboardSkeleton = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {range(4).map((index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <FiltersSkeleton />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {range(6).map((index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
