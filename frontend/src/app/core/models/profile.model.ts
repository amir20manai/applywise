export interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  role: string;
  createdAt: string;
}

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  profilePicture: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}