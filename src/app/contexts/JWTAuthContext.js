import React, { createContext, useEffect, useReducer } from 'react';
import { MatxLoading } from 'app/components';
import { auth } from '../../firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';

import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const initialState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null,
  userRole: null,
};

const setSession = (user, userRole) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', userRole);
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isAuthenticated, user } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user,
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }
    case 'REGISTER': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialState,
  method: 'Firebase',
  login: () => Promise.resolve(),
  logout: () => {},
  register: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    const collectionName = 'users';
    const documentId = user.uid;
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userRole = data.role;
      setSession(user, userRole);
      dispatch({
        type: 'LOGIN',
        payload: {
          user,
        },
      });
    }
  };

  const register = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
    const user = auth.currentUser;
    const uid = user.uid;

    setDoc(doc(db, 'users', uid), {
      email: user.email,
      role: 'USER',
    });

    setSession(user);

    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
  };

  const updatePasswordForCurrentUser = (password) => {
    return updatePassword(auth.currentUser, password);
  };

  const resetPassword = (email) => {
    sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    signOut(auth);
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch({
          type: 'INIT',
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: 'INIT',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    });
  }, []);

  if (!state.isInitialised) {
    return <MatxLoading />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'Firebase',
        login,
        logout,
        register,
        resetPassword,
        updatePasswordForCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
