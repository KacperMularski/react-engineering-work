import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const ProfileSettings = Loadable(lazy(() => import('./ProfileSettings')));

const profileRoutes = [{ path: '/profile', element: <ProfileSettings />, auth: authRoles.all }];

export default profileRoutes;
