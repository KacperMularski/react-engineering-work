import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const WorkerEventsCalendar = Loadable(lazy(() => import('./WorkerEventsCalendar')));

const workerEventsCalendar = [
  {
    path: '/workerEventsCalendar',
    element: <WorkerEventsCalendar />,
    auth: authRoles.worker,
  },
];

export default workerEventsCalendar;
