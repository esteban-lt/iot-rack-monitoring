import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}

export const SummaryCard = ({ title, count, color, active, onClick }: Props) => {
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={active}
      className={cn('cursor-pointer hover:bg-muted/50', active && 'ring-2 ring-primary')}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onClick();
      }}
    >
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className={cn('size-2.5 rounded-full', color)} />
          {title}
        </CardTitle>
        <span className="text-lg font-bold">{count}</span>
      </CardHeader>
    </Card>
  );
};
