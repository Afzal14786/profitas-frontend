"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, tokenStore, extractErrorMessage } from "@/lib/api";
import {useRouter} from "next/navigation";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = tokenStore.access;
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: AuthUser }>("/users/me")
      .then((r) => setUser(r.data.data))
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const r = await api.post("/auth/login", { email, password });
      const { user, accessToken, refreshToken } = r.data.data;
      tokenStore.set(accessToken, refreshToken);
      setUser(user);
      return user as AuthUser;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const r = await api.post("/auth/register", { name, email, password });
      const { user, accessToken, refreshToken } = r.data.data;
      tokenStore.set(accessToken, refreshToken);
      setUser(user);
      return user as AuthUser;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    router.push("/logout");
  };

  const refreshUser = async () => {
    const r = await api.get<{ data: AuthUser }>("/users/me");
    setUser(r.data.data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}