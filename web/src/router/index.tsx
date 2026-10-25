import { createBrowserRouter } from 'react-router';

import AppLayout from '@/layouts/app-layout';
import DashboardPage from '@/app/dashboard';
import { lazy } from 'react';

const RacksPage = lazy(() => import('@/app/racks'));
const RackDetailsPage = lazy(() => import('@/app/racks/[id]'));
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
            children: [
              {
                index: true,
                element: <RacksPage />,
              },
              {
                path: ':id',
                element: <RackDetailsPage />,
              },
            ],
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