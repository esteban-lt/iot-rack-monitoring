import { createBrowserRouter } from 'react-router';

import AppLayout from '@/layouts/app-layout';
import DashboardPage from '@/app/dashboard';
import { AlarmsSkeleton } from '@/app/alarms/components/skeletons/alarms-skeleton';
import { DevicesSkeleton } from '@/app/devices/components/skeletons/devices-skeleton';
import { RackCrumb } from '@/app/racks/[id]/components/rack-crumb';
import { RackDetailSkeleton } from '@/app/racks/[id]/components/skeletons/rack-detail-skeleton';
import { RacksSkeleton } from '@/app/racks/components/skeletons/racks-skeleton';
import { ErrorScreen } from '@/components/error-screen';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/app/auth'));
const RacksPage = lazy(() => import('@/app/racks'));
const RackDetailsPage = lazy(() => import('@/app/racks/[id]'));
const RackModelPage = lazy(() => import('@/app/racks/[id]/model'));
const DevicesPage = lazy(() => import('@/app/devices'));
const AlarmsPage = lazy(() => import('@/app/alarms'));

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorScreen title="Error" message="Ocurrió un error inesperado." />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            handle: { crumb: 'Dashboard' },
            element: <DashboardPage />,
          },
          {
            path: 'racks',
            handle: { crumb: 'Racks' },
            children: [
              {
                index: true,
                element: <Suspense fallback={<RacksSkeleton />}><RacksPage /></Suspense>,
              },
              {
                path: ':id',
                handle: { crumb: RackCrumb },
                children: [
                  {
                    index: true,
                    element: <Suspense fallback={<RackDetailSkeleton />}><RackDetailsPage /></Suspense>,
                  },
                  {
                    path: 'model',
                    handle: { crumb: 'Modelo 3D' },
                    element: <Suspense><RackModelPage /></Suspense>,
                  },
                ],
              },
            ],
          },
          {
            path: 'devices',
            handle: { crumb: 'Dispositivos' },
            element: <Suspense fallback={<DevicesSkeleton />}><DevicesPage /></Suspense>,
          },
          {
            path: 'alarms',
            handle: { crumb: 'Alarmas' },
            element: <Suspense fallback={<AlarmsSkeleton />}><AlarmsPage /></Suspense>,
          },
        ],
      },
      {
        path: '*',
        element: <ErrorScreen title="404" message="Esta página no se pudo encontrar." />,
      },
    ],
  },
]);
