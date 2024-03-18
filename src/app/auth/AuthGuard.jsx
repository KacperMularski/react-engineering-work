import useAuth from 'app/hooks/useAuth';
import { flat } from 'app/utils/utils';
import { Navigate, useLocation } from 'react-router-dom';
import AllPages from '../routes';

const userHasPermission = (pathname, user, userRole, routes) => {
  if (!user) {
    return false;
  }
  const matched = routes.find((r) => r.path === pathname);

  const authenticated =
    matched && matched.auth && matched.auth.length ? matched.auth.includes(userRole) : true;
  return authenticated;
};

const AuthGuard = ({ children }) => {
  let { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const userRole = localStorage.getItem('userRole');
  const routes = flat(AllPages);

  const hasPermission = userHasPermission(pathname, user, userRole, routes);
  let authenticated = isAuthenticated && hasPermission;

  return (
    <>
      {authenticated ? (
        children
      ) : (
        <Navigate replace to="/session/signin" state={{ from: pathname }} />
      )}
    </>
  );
};

export default AuthGuard;
