"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { LogIn, AlertCircle, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AuthService } from "@/services/auth.service";
import { UserRole } from "@/types";

interface LoginFormInputs {
  identifier: string;
  password: string;
}

export function LoginForm() {
  const [activeTab, setActiveTab] = useState<UserRole>("student");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage(null);
    reset();
  };

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await AuthService.login({
        userId: data.identifier,
        password: data.password,
        role: activeTab,
      });

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      const isManager = response.user.role === "manager" || response.user.type === "staff" || (response.user as any).type === "manager";

      toast.success(
        `Logged in successfully as ${isManager ? "Dorm Manager" : "Student"}`
      );

      if (isManager) {
        window.location.href = "/students";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      const fallbackMsg =
        activeTab === "manager"
          ? "Invalid email or password."
          : "Invalid Student ID or Password.";
      const msg = error.message || fallbackMsg;
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-4 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Dormitory Portal</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        <Card className="shadow-lg border border-border">
          <CardContent className="p-8">
            <div className="flex gap-3 mb-6 p-1 bg-muted/40 rounded-xl">
              <button
                type="button"
                onClick={() => handleTabChange("student")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "student"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("manager")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "manager"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4 text-primary" />
                Manager
              </button>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {activeTab === "manager" ? "Email Address" : "Student ID"}
                </Label>
                <Input
                  id="identifier"
                  type={activeTab === "manager" ? "email" : "text"}
                  {...register("identifier", {
                    required:
                      activeTab === "manager"
                        ? "Email is required"
                        : "Student ID is required",
                  })}
                  placeholder={
                    activeTab === "manager"
                      ? "admin@dorm.com"
                      : "STU-101"
                  }
                  disabled={isLoading}
                />
                {errors.identifier && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.identifier.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.password.message}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-1" />
                {isLoading
                  ? "Signing in..."
                  : activeTab === "manager"
                  ? "Sign In as Manager"
                  : "Sign In as Student"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-xs text-foreground uppercase tracking-wider mb-2">
                Demo Accounts
              </p>
              <p className="font-mono text-xs">
                Student: <span className="font-semibold text-foreground">STU-101</span> / <span className="font-semibold text-foreground">password123</span>
              </p>
              <p className="font-mono text-xs">
                Manager: <span className="font-semibold text-foreground">admin@dorm.com</span> / <span className="font-semibold text-foreground">admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
