import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const AdminUsersConfig = Loadable(lazy(() => import('./AdminUsersConfig')));
const AdminUsersConfigAddNew = Loadable(lazy(() => import('./AdminUsersConfigAddNew')));

const adminUsersConfigRoutes = [
  {
    path: '/adminUsersConfig',
    element: <AdminUsersConfig />,
    auth: authRoles.admin,
  },
  {
    path: '/adminUsersConfigAddNewUser',
    element: <AdminUsersConfigAddNew />,
    auth: authRoles.admin,
  },
];

export default adminUsersConfigRoutes;
