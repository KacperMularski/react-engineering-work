import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const WorkerRepairOrders = Loadable(lazy(() => import('./WorkerRepairOrders')));

const workerRepairOrders = [
  {
    path: '/workerRepairOrders',
    element: <WorkerRepairOrders />,
    auth: authRoles.worker,
  },
];

export default workerRepairOrders;
