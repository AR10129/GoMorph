import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string;
  username: string;
  login: (email: string, username: string, token: string) => void;
  logout: () => void;
}

const defaultValue: AuthContextType = {
  isLoggedIn: false,
  userEmail: '',
  username: '',
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setUsername(storedUsername || '');
    }
  }, []);

  const login = (email: string, username: string, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', username);
    setIsLoggedIn(true);
    setUserEmail(email);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUserEmail('');
    setUsername('');
  };

  const value: AuthContextType = {
    isLoggedIn,
    userEmail,
    username,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
