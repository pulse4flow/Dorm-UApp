"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AuthService } from "@/services/auth.service";

interface LoginForm {
  email: string;
  password: string;
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      const response = await AuthService.login({
        userId: data.email,
        password: data.password,
      });

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      toast.success("Logged in successfully");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-4">
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

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  {...register("email", {
                    required: "Email or Student ID is required",
                  })}
                  placeholder="student1@dorm.com or STU-101"
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.email.message}</span>
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
                <LogIn className="w-5 h-5" />
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p className="mb-2">Demo Accounts:</p>
              <p className="font-mono text-xs">
                Student: student1@dorm.com or STU-101 / password123
              </p>
              <p className="font-mono text-xs">
                Manager: admin@dorm.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
