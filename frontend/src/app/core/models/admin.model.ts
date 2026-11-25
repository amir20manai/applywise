import { ApplicationStatus } from './application.model';
import { InterviewStatus } from './interview.model';

export interface TopOffer {
  id: number;
  title: string;
  companyName: string | null;
  applications: number;
}

export interface AdminStats {
  candidates: number;
  companies: number;
  activeOffers: number;
  totalApplications: number;
  applicationsLast7Days: number;
  applicationsByStatus: Record<string, number>;
  topOffers: TopOffer[];
}

// Candidature reçue sur une offre de la plateforme
export interface AdminApplication {
  id: number;
  jobTitle: string;
  companyName: string;
  location: string | null;
  jobUrl: string | null;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  resumeId: number | null;
  resumeFileName: string | null;
  interviewCount: number;
}

export interface AdminInterview {
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
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
}