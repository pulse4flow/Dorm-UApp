"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";
import { AuthService } from "@/services/auth.service";

interface UseAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userData && token) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }

      // Sync latest user profile (including current dormScore) from backend
      AuthService.getProfile()
        .then((freshUser) => {
          if (freshUser) {
            localStorage.setItem("user", JSON.stringify(freshUser));
            setUser(freshUser);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);

      try {
        const response = await AuthService.login({ userId: email, password });

        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        setUser(response.user);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const updateUser = useCallback(
    (data: Partial<UserProfile>) => {
      if (user) {
        const updatedUser = { ...user, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    },
    [user]
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isManager: user?.role === "manager",
    login,
    logout,
    updateUser,
  };
}
