import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const ActiveRepairOrders = Loadable(lazy(() => import('./ActiveRepairOrders')));
const NonActiveRepairOrders = Loadable(lazy(() => import('./NonActiveRepairOrders')));

const checkRepairOrderRoutes = [
  {
    path: '/activeRepairOrders',
    element: <ActiveRepairOrders />,
    auth: authRoles.all,
  },
  {
    path: '/nonActiveRepairOrders',
    element: <NonActiveRepairOrders />,
    auth: authRoles.all,
  },
];

export default checkRepairOrderRoutes;
