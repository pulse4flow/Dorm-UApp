"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ScoreAdjustment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScoreAdjustFormProps {
  studentId: string;
  studentName: string;
  currentScore: number;
  onSubmit: (data: ScoreAdjustment) => void;
  onClose: () => void;
}

export function ScoreAdjustForm({
  studentId,
  studentName,
  currentScore,
  onSubmit,
  onClose,
}: ScoreAdjustFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScoreAdjustment>({
    defaultValues: {
      studentId,
      score: currentScore,
      reason: "",
    },
  });

  const onFormSubmit = (data: ScoreAdjustment) => {
    if (data.score < 0 || data.score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    const diff = data.score - currentScore;
    onSubmit(data);
    toast.success(
      `${studentName}'s score ${diff > 0 ? "increased" : "decreased"} to ${data.score}`
    );
    onClose();
    reset();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Student Score</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{studentName}</p>
                <p className="text-sm text-muted-foreground">
                  Current Score: {currentScore}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">New Score (0-100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              {...register("score", {
                required: "Score is required",
                min: { value: 0, message: "Minimum score is 0" },
                max: { value: 100, message: "Maximum score is 100" },
                valueAsNumber: true,
              })}
              placeholder="Enter new score"
            />
            {errors.score && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.score.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              {...register("reason", { required: "Reason is required" })}
              rows={3}
              placeholder="Explain why the score is being adjusted..."
            />
            {errors.reason && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.reason.message}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Change</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
