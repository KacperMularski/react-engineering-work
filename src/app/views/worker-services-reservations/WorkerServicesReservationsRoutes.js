import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const WorkerServicesReservations = Loadable(lazy(() => import('./WorkerServicesReservations')));

const workerServicesReservationsRoutes = [
  {
    path: '/workerServicesReservations',
    element: <WorkerServicesReservations />,
    auth: authRoles.worker,
  },
];

export default workerServicesReservationsRoutes;
