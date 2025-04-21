import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup, logout, checkSession } from "../api/authApi";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  handleLogin: (username: string, password: string) => Promise<void>;
  handleSignup: (username: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const data = await checkSession();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to check session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const data = await login(username, password);
      setUser(data.user);
      navigate("/notes");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleSignup = async (username: string, password: string) => {
    try {
      const data = await signup(username, password);
      setUser(data.user);
      navigate("/notes");
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, handleLogin, handleSignup, handleLogout }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
