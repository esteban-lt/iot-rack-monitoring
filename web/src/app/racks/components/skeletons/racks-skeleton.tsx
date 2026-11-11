import { FiltersSkeleton } from '@/components/skeletons/filters-skeleton';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export const RacksSkeleton = () => {
  return (
    <>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-28" />
      </div>
      <FiltersSkeleton />
      <TableSkeleton columns={6} />
    </>
  );
}
