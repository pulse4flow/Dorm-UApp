"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LogIn, AlertCircle, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AuthService } from "@/services/auth.service";

interface LoginFormInputs {
  studentId: string;
  password: string;
}

type UserRole = "manager" | "student";

interface LoginFormProps {
  onLogin?: (role: UserRole) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("student");

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await AuthService.login({
        studentId: data.studentId,
        password: data.password,
        role,
      });

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      toast.success(
        `Logged in successfully as ${
          response.user.role === "manager" ? "Dorm Manager" : "Student"
        }`
      );
      if (onLogin) {
        onLogin(response.user.role || role);
      }
      window.location.href = "/";
    } catch (error: any) {
      const msg = error?.message || "Invalid Student ID or Password.";
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-4 shadow-md">
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
          <p className="text-muted-foreground">Sign in with your Student ID and Password</p>
        </div>

        <Card className="shadow-lg border-border">
          <CardContent className="p-8">
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition-all ${
                  role === "student"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                <User className="w-5 h-5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("manager");
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition-all ${
                  role === "manager"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                <Shield className="w-5 h-5" />
                Dorm Manager
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
                <Label htmlFor="studentId" className="font-semibold">
                  {role === "manager" ? "Email / Staff ID" : "Student ID"}
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  {...register("studentId", {
                    required:
                      role === "manager"
                        ? "Email or Staff ID is required"
                        : "Student ID is required",
                  })}
                  placeholder={
                    role === "manager" ? "admin@dorm.com" : "STU-101"
                  }
                  disabled={isLoading}
                  autoComplete="username"
                  className="h-11"
                />
                {errors.studentId && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.studentId.message}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="h-11"
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
                className="w-full h-11 text-base"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-1" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Valid Demo Credentials:</p>
              <div className="space-y-1 font-mono text-xs bg-muted/50 p-3 rounded-lg border">
                <p>
                  <span className="text-muted-foreground">Student:</span> STU-101 / password123
                </p>
                <p>
                  <span className="text-muted-foreground">Manager:</span> admin@dorm.com / admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
