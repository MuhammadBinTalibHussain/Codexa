import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("codepulse_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("codepulse_token"));
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const { user: freshUser } = await authService.getMe();
        setUser(freshUser);
        localStorage.setItem("codepulse_user", JSON.stringify(freshUser));
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("codepulse_token");
        localStorage.removeItem("codepulse_user");
      } finally {
        setAuthLoading(false);
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("codepulse_token", data.token);
    localStorage.setItem("codepulse_user", JSON.stringify(data.user));
    return data.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    return authService.register(username, email, password);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("codepulse_token");
    localStorage.removeItem("codepulse_user");
    authService.logout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};