import { createBrowserRouter } from 'react-router';

import AppLayout from '@/layouts/app-layout';
import DashboardPage from '@/app/dashboard';
import { lazy } from 'react';

const RacksPage = lazy(() => import('@/app/racks'));
const DevicesPage = lazy(() => import('@/app/devices'));
const AlarmsPage = lazy(() => import('@/app/alarms'));

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