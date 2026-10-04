import { createBrowserRouter } from 'react-router';

import AppLayout from '@/layouts/app-layout';
import DashboardPage from '@/dashboard';
import { lazy } from 'react';

const RacksPage = lazy(() => import('@/racks'));
const DevicesPage = lazy(() => import('@/devices'));
const AlarmsPage = lazy(() => import('@/alarms'));

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'racks',
            element: <RacksPage />,
          },
          {
            path: 'devices',
            element: <DevicesPage />,
          },
          {
            path: 'alarms',
            element: <AlarmsPage />,
          },
        ],
      },
    ],
  },
]);