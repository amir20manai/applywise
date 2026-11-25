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

// Une candidature est envoyée tout de suite (Applied): il n'y a plus de "Pending"
export const STATUSES: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'APPLIED', label: 'Applied', color: '#2457f5' },
  { key: 'UNDER_REVIEW', label: 'Under review', color: '#8a63d2' },
  { key: 'INTERVIEW', label: 'Interview', color: '#e0a21b' },
  { key: 'ACCEPTED', label: 'Accepted', color: '#1f9d6b' },
  { key: 'REJECTED', label: 'Rejected', color: '#d64545' },
  { key: 'WITHDRAWN', label: 'Withdrawn', color: '#b8c2cd' },
];

export interface ApplyPayload {
  jobOfferId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeId: number;
  coverLetter?: string;
}