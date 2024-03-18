import Loadable from 'app/components/Loadable';
import { lazy } from 'react';

const NotFound = Loadable(lazy(() => import('./NotFound')));
const ForgotPassword = Loadable(lazy(() => import('./ForgotPassword')));
const Login = Loadable(lazy(() => import('./Login')));
const Register = Loadable(lazy(() => import('./Register')));

const sessionRoutes = [
  { path: '/session/signup', element: <Register /> },
  { path: '/session/signin', element: <Login /> },
  { path: '/session/forgot-password', element: <ForgotPassword /> },
  { path: '/session/404', element: <NotFound /> },
];

export default sessionRoutes;
