import React, { createContext, useState, useCallback, useEffect } from "react";
import axiosinstance from "../utils/axiosinstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate token on app load
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosinstance.get("/get-user");
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosinstance.post("/login", {
        email,
        password,
      });

      if (response.data && response.data.accesstoken) {
        localStorage.setItem("token", response.data.accesstoken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (fullName, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosinstance.post("/create-user", {
        fullName,
        email,
        password,
      });

      if (response.data && response.data.accesstoken) {
        localStorage.setItem("token", response.data.accesstoken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
