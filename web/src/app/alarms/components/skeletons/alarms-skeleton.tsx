import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { range } from '@/lib/utils';

export const AlarmsSkeleton = () => {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {range(3).map((index) => (
          <Skeleton key={index} className="h-8 w-40" />
        ))}
      </div>
      <TableSkeleton columns={7} rows={10} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
    </>
  );
}
