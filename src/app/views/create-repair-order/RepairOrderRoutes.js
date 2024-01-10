import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const RepairOrder = Loadable(lazy(() => import('./RepairOrder')));

const repairOrderRoutes = [
  {
    path: '/repairOrder',
    element: <RepairOrder />,
    auth: authRoles.all,
  },
];

export default repairOrderRoutes;
