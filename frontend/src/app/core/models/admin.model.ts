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