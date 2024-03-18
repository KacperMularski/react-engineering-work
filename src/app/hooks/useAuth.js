import { useContext } from 'react';
import AuthContext from 'app/contexts/AuthContext';

const useAuth = () => useContext(AuthContext);

export default useAuth;
