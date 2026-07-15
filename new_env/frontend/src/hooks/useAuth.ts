"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, UserRole } from "@/types";

interface UseAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  login: (userId: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (userId: string, password: string, role: UserRole) => {
      setIsLoading(true);

      // Simulated login - replace with actual API call
      const userData: UserProfile =
        role === "manager"
          ? {
              id: userId,
              name: "Admin Manager",
              role: "manager",
              room: "Office",
              email: "admin@dorm.com",
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : {
              id: userId,
              name: "John Doe",
              role: "student",
              room: "A-204",
              dormScore: 85,
              email: "john@dorm.com",
              createdAt: new Date(),
              updatedAt: new Date(),
            };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

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
