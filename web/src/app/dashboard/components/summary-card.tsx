import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Props {
  title: string;
  content: number;
}

export const SummaryCard = ({ title, content }: Props) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <span className="text-lg font-bold">{content}</span>
      </CardHeader>
    </Card>
  );
};
