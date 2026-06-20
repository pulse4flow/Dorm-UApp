"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Megaphone, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Broadcast } from "./BroadcastBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface AdminBroadcastFormProps {
  onBroadcast: (broadcast: Omit<Broadcast, "id" | "createdAt">) => void;
}

interface FormData {
  title: string;
  message: string;
  type: "info" | "warning" | "urgent";
}

export function AdminBroadcastForm({ onBroadcast }: AdminBroadcastFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      type: "info",
    },
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const onSubmit = (data: FormData) => {
    onBroadcast(data);
    toast.success("Broadcast sent to all residents");
    reset();
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg hover:from-primary/15 hover:to-primary/10 transition-colors"
      >
        <Megaphone className="w-5 h-5 text-primary" />
        <div className="text-left flex-1">
          <h4 className="text-primary">Admin Broadcast</h4>
          <p className="text-sm text-muted-foreground">
            Send announcement to all residents
          </p>
        </div>
      </button>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="text-primary">Admin Broadcast</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broadcast-title">Title</Label>
            <Input
              id="broadcast-title"
              type="text"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Scheduled Maintenance"
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.title.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea
              id="broadcast-message"
              {...register("message", { required: "Message is required" })}
              rows={3}
              placeholder="Enter your announcement message..."
            />
            {errors.message && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.message.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="broadcast-type">Type</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) => setValue("type", value as "info" | "warning" | "urgent")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info - General announcement</SelectItem>
                <SelectItem value="warning">Warning - Important notice</SelectItem>
                <SelectItem value="urgent">Urgent - Critical alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsExpanded(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Send className="w-4 h-4" />
              Send Broadcast
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
