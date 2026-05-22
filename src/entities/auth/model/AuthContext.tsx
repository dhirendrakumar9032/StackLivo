import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  authenticateLocalUser,
  clearLocalSession,
  createLocalUser,
  loadCurrentUser,
} from "@/entities/auth/model/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadCurrentUser);

  const login = useCallback((credentials) => {
    const user = authenticateLocalUser(credentials);
    setCurrentUser(user);
    return user;
  }, []);

  const signup = useCallback((payload) => {
    const user = createLocalUser(payload);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    clearLocalSession();
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      logout,
    }),
    [currentUser, login, logout, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
