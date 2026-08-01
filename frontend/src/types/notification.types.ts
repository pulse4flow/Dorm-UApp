export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType =
  | "announcement"
  | "repair"
  | "activity"
  | "score"
  | "system";

export interface NotificationFilter {
  isRead?: boolean;
  type?: NotificationType;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}
