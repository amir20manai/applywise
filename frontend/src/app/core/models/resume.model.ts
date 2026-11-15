export interface Resume {
  id: number;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  defaultResume: boolean;
  uploadedAt: string;
}