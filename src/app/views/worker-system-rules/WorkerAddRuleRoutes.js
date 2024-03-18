import Loadable from 'app/components/Loadable';
import { lazy } from 'react';
import { authRoles } from '../../auth/authRoles';

const WorkerAddRule = Loadable(lazy(() => import('./WorkerAddRule')));
const WorkerShowRules = Loadable(lazy(() => import('./WorkerShowRules')));

const workerAddRuleRoutes = [
  {
    path: '/workerAddRule',
    element: <WorkerAddRule />,
    auth: authRoles.worker,
  },
  {
    path: '/workerShowRules',
    element: <WorkerShowRules />,
    auth: authRoles.worker,
  },
];

export default workerAddRuleRoutes;
