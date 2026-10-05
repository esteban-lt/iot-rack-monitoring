import { Filters } from './components/filters';
import { columns } from './components/data-table/columns';
import { DataTable } from './components/data-table/data-table';
import { alarms } from './data';

const Index = () => {
  return (
    <>
      <Filters alarms={alarms} />

      <DataTable columns={columns} data={alarms} />
    </>
  );
}

export default Index;
