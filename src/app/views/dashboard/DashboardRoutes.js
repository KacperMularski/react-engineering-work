import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const Dashboard = Loadable(lazy(() => import('./Dashboard')));

const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    auth: authRoles.all,
  },
];

export default dashboardRoutes;
