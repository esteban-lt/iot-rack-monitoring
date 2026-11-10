import { Skeleton } from '@/components/ui/skeleton';
import { range } from '@/lib/utils';

export const FiltersSkeleton = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Skeleton className="h-8 w-full sm:w-64" />
      <div className="flex flex-wrap items-center gap-2">
        {range(5).map((index) => (
          <Skeleton key={index} className="h-8 w-24" />
        ))}
      </div>
    </div>
  );
}
