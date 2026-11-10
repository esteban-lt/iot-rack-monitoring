import { FiltersSkeleton } from '@/components/skeletons/filters-skeleton';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';

export const DevicesSkeleton = () => {
  return (
    <>
      <FiltersSkeleton />
      <TableSkeleton columns={7} />
    </>
  );
}
