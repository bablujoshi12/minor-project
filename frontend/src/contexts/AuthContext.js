import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    const userWithLogin = {
      ...userData,
      loginTime: new Date().toLocaleString(),
    };
    setUser(userWithLogin);
    localStorage.setItem('user', JSON.stringify(userWithLogin));
  };

  const signup = (userData) => {
    const userWithSignup = {
      ...userData,
      signupTime: new Date().toLocaleString(),
      loginTime: new Date().toLocaleString(),
    };
    setUser(userWithSignup);
    localStorage.setItem('user', JSON.stringify(userWithSignup));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Load user from localStorage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

