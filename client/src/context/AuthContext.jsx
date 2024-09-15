import { createContext, useReducer } from 'react';
import { setLogoutFunction } from '../api/axios';
const AuthContext = createContext();

const initialState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

// eslint-disable-next-line react/prop-types
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);


  const login = (user) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // TODO: avoid full page refresh 
    window.location.href = '/signin';
  };

  setLogoutFunction(logout);
  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
