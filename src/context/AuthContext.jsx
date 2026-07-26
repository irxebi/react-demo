import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'react-demo-auth';

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

  function login(phoneNumber) {
    localStorage.setItem(STORAGE_KEY, phoneNumber);
    setIsLoggedIn(true);
    return true;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
  }

  const value = useMemo(
    () => ({ isLoggedIn, login, logout }),
    [isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
