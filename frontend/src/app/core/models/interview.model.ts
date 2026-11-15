export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface Interview {
  id: number;
  title: string;
  scheduledAt: string | null;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  status: InterviewStatus;
  createdAt: string;
  applicationId: number;
  jobTitle: string;
  companyName: string;
}

export interface InterviewPayload {
  title: string;
  scheduledAt?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
}

export const INTERVIEW_STATUSES: { key: InterviewStatus; label: string; color: string }[] = [
  { key: 'SCHEDULED', label: 'Scheduled', color: '#2457f5' },
  { key: 'RESCHEDULED', label: 'Rescheduled', color: '#e0a21b' },
  { key: 'COMPLETED', label: 'Completed', color: '#1f9d6b' },
  { key: 'CANCELLED', label: 'Cancelled', color: '#b8c2cd' },
];