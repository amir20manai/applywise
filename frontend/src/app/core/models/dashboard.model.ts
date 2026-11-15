export interface DashboardStats {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  upcomingInterviews: number;
  resumesCount: number;
}