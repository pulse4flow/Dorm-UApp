"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LogIn, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface LoginForm {
  studentId: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          studentId: data.studentId,
          name: "John Doe",
          room: "A-204",
          dormScore: 85,
        })
      );

      toast.success("Login successful!");
      router.replace("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="mb-2">Dormitory Portal</h1>
          <p className="text-muted-foreground">
            Sign in to access your account
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  {...register("studentId", {
                    required: "Student ID is required",
                  })}
                  placeholder="Enter your student ID"
                  disabled={isLoading}
                />
                {errors.studentId && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {errors.studentId.message}
                    </span>
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
                    <span className="text-sm">
                      {errors.password.message}
                    </span>
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
              Demo: Use any credentials to login
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
