import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';
import { MatxLayout } from 'app/components';

const Dashboard = Loadable(lazy(() => import('./Dashboard')));

const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    auth: authRoles.guest,
  },
];

export default dashboardRoutes;
