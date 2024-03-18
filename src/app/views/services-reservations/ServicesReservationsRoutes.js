import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const ServicesReservations = Loadable(lazy(() => import('./ServicesReservations')));
const CheckServicesReservations = Loadable(lazy(() => import('./CheckServicesReservations')));

const servicesReservationsRoutes = [
  {
    path: '/servicesReservations',
    element: <ServicesReservations />,
    auth: authRoles.all,
  },
  {
    path: '/checkServicesReservations',
    element: <CheckServicesReservations />,
    auth: authRoles.user,
  },
];

export default servicesReservationsRoutes;
