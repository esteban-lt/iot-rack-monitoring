import { Summary } from './components/summary';
import { Filters } from './components/filters';
import { RackGrid } from './components/rack-grid';
import { summaries } from './data';

const Index = () => {
  return (
    <>
      <Summary summaries={summaries} />

      <Filters summaries={summaries} />

      <RackGrid summaries={summaries} />
    </>
  );
}

export default Index;
