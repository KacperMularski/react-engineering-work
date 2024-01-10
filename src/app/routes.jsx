import AuthGuard from 'app/auth/AuthGuard';
import chartsRoute from 'app/views/charts/ChartsRoute';
import dashboardRoutes from 'app/views/dashboard/DashboardRoutes';
import materialRoutes from 'app/views/material-kit/MaterialRoutes';
import profileRoutes from './views/profile/ProfileRoutes';
import NotFound from 'app/views/sessions/NotFound';
import sessionRoutes from 'app/views/sessions/SessionRoutes';
import { Navigate } from 'react-router-dom';
import MatxLayout from './components/MatxLayout/MatxLayout';
import repairOrderRoutes from './views/create-repair-order/RepairOrderRoutes';
import checkRepairOrderRoutes from './views/check-repair-orders/CheckRepairOrdersRoutes';
import servicesReservationsRoutes from './views/services-reservations/ServicesReservationsRoutes';
import workerRepairOrdersRoutes from './views/worker-repair-orders/WorkerRepairOrdersRoutes';
import workerServicesReservationsRoutes from './views/worker-services-reservations/WorkerServicesReservationsRoutes';
const routes = [
  // AuthGuard wrapper for protected routes
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...dashboardRoutes,
      ...chartsRoute,
      ...materialRoutes,
      ...profileRoutes,
      ...repairOrderRoutes,
      ...checkRepairOrderRoutes,
      ...servicesReservationsRoutes,
      ...workerRepairOrdersRoutes,
      ...workerServicesReservationsRoutes,
    ],
  },

  // Other routes
  ...sessionRoutes,

  { path: '/', element: <Navigate to="/dashboard" /> },
  { path: '/profile', element: <Navigate to="/profile" /> },
  { path: '*', element: <NotFound /> },
];

export default routes;
