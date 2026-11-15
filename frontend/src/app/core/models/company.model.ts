export interface Company {
  id: number;
  name: string;
  email: string | null;
  website: string | null;
  logo: string | null;
  description: string | null;
  industry: string | null;
  location: string | null;
  createdAt: string;
}

export interface CompanyPayload {
  name: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  industry?: string;
  location?: string;
}