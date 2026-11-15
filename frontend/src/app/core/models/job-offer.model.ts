export interface JobOffer {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  salary: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  deadline: string | null;
  createdAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  companyId: number | null;
  companyName: string | null;
  companyLogo: string | null;
}

export interface JobOfferPayload {
  title: string;
  companyId: number;
  description?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: string;
  sourceUrl?: string;
  deadline?: string;
}