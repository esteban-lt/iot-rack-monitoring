import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizeOptions = [10, 25, 50, 100];

const disabledClassName = 'pointer-events-none opacity-50';

export const TablePagination = ({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: Props) => {
  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= totalPages;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        Filas por página
        <Select items={pageSizeOptions.map((size) => ({ value: size, label: String(size) }))} value={pageSize} onValueChange={(value) => onPageSizeChange(value!)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Anterior"
              className={isFirstPage ? disabledClassName : 'cursor-pointer'}
              onClick={() => onPageChange(page - 1)}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4 text-sm">Página {page + 1} de {Math.max(totalPages, 1)}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              text="Siguiente"
              className={isLastPage ? disabledClassName : 'cursor-pointer'}
              onClick={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
