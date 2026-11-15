import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { isAxiosError } from 'axios';
import { router } from './router';

// Client errors (bad id, missing entity) won't change on retry
const retry = (failureCount: number, error: Error) => {
  const status = isAxiosError(error) ? error.response?.status ?? 500 : 500;
  return status >= 500 && failureCount < 3;
};

const queryClient = new QueryClient({ defaultOptions: { queries: { retry } } });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
