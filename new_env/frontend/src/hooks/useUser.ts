"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";

interface UseUserReturn {
  user: UserProfile | null;
  isLoading: boolean;
  updateUser: (data: Partial<UserProfile>) => void;
  refreshUser: () => void;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(() => {
    setIsLoading(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    updateUser,
    refreshUser,
  };
}
