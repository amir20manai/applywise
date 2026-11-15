export type LetterLanguage = 'en' | 'fr';

export interface CoverLetterPayload {
  jobTitle: string;
  companyName: string;
  location?: string;
  highlights?: string;
  language: LetterLanguage;
}

export interface CoverLetterResult {
  text: string;
}

export interface InterviewPrepResult {
  text: string;
}

export type FollowUpPurpose = 'follow_up' | 'thank_you';

export interface FollowUpPayload {
  purpose: FollowUpPurpose;
  language: LetterLanguage;
  details?: string;
}

export interface FollowUpResult {
  text: string;
}