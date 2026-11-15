export type NotificationType =
  | 'APPLICATION_UPDATE'
  | 'INTERVIEW_REMINDER'
  | 'JOB_RECOMMENDATION'
  | 'SYSTEM';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  APPLICATION_UPDATE: 'Application',
  INTERVIEW_REMINDER: 'Interview',
  JOB_RECOMMENDATION: 'Job suggestion',
  SYSTEM: 'System',
};