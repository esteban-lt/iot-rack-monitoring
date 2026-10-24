import { Filters } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { summaries } from './data';

const Index = () => {
  return (
    <>
      <Filters summaries={summaries} />
      <DataTable columns={columns} data={summaries} />
    </>
  );
}

export default Index;
