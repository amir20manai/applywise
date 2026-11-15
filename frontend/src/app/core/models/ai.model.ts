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