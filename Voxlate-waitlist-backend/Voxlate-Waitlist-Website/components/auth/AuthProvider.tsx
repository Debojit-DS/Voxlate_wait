"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getCurrentUser, logoutUser } from "@/lib/authApi";

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The real session lives in an httpOnly cookie set by the backend on
  // login/signup, so it can't be read directly from client JS. On mount we
  // ask the server who's currently signed in and hydrate from that,
  // instead of trusting anything stored client-side.
  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((data) => {
      if (!cancelled) setUser(data);
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // login/signup here just sync local state after the caller has already
  // completed a successful loginUser()/signupUser() call (which sets the
  // session cookie server-side) — they don't make their own request.
  const login = (userData: User) => {
    setUser(userData);
  };

  const signup = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    void logoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
