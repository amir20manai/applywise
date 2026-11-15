export type ApplicationStatus =
  | 'PENDING'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: number;
  jobTitle: string;
  companyName: string;
  jobUrl: string | null;
  location: string | null;
  notes: string | null;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  jobOfferId: number | null;
  resumeId: number | null;
  resumeFileName: string | null;
}

export const STATUSES: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'PENDING', label: 'Pending', color: '#8b9bb0' },
  { key: 'APPLIED', label: 'Applied', color: '#2457f5' },
  { key: 'UNDER_REVIEW', label: 'Under review', color: '#8a63d2' },
  { key: 'INTERVIEW', label: 'Interview', color: '#e0a21b' },
  { key: 'ACCEPTED', label: 'Accepted', color: '#1f9d6b' },
  { key: 'REJECTED', label: 'Rejected', color: '#d64545' },
  { key: 'WITHDRAWN', label: 'Withdrawn', color: '#b8c2cd' },
];
export interface ApplicationPayload {
  jobTitle: string;
  companyName: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  status: ApplicationStatus;
  resumeId?: number;
}