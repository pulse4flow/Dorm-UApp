"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";
import { AuthService } from "@/services/auth.service";

interface UseAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  login: (studentIdOrEmail: string, password: string) => Promise<void>;
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
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (studentIdOrEmail: string, password: string) => {
      setIsLoading(true);

      try {
<<<<<<< HEAD
        const response = await AuthService.login({ studentId: studentIdOrEmail, password });
=======
        const response = await AuthService.login({ userId: email, password });
>>>>>>> 93ce3134bddf883293fa3d8aa7e9d3a9e7e7df6c

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
