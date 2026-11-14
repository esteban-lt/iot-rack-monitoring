import { FiltersSkeleton } from '@/components/skeletons/filters-skeleton';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';

export const RacksSkeleton = () => {
  return (
    <>
      <FiltersSkeleton />
      <TableSkeleton columns={6} />
    </>
  );
}
