export type ApplicationStatus =
  | "not-yet-open"
  | "not-started"
  | "in-progress"
  | "submitted"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "awarded";

export interface ChecklistItem {
  id: string;
  universityId?: string;
  scholarshipId?: string;
  item: string;
  completed: boolean;
}

export interface LinkedScholarship {
  id: string;
  name: string;
  status: ApplicationStatus;
  amount: number;
  currency: string;
}

export interface University {
  id: string;
  name: string;
  region: string;
  status: ApplicationStatus;
  tuition: number;
  currency: string;
  startDate: string | null;
  deadline: string | null;
  applicationLink?: string;
  notes?: string;
  checklist: ChecklistItem[];
  scholarships?: LinkedScholarship[];
}

export interface Scholarship {
  id: string;
  name: string;
  status: ApplicationStatus;
  amount: number;
  currency: string;
  coverage: "Full Scholarship" | "Tuition Only" | "Stipend Only" | "Tuition + Stipend";
  eligibleUniversities: string[];
  notes?: string;
  link?: string;
  startDate?: string | null;
  deadline?: string | null;
  checklist: ChecklistItem[];
}

export interface User {
  id: string;
  email: string;
}

export const FX_TO_GHS: Record<string, number> = {
  USD: 10.94,
  EUR: 13.0,
  GBP: 14.98,
  SEK: 1.3,
  GHS: 1.0,
};

export const DEFAULT_CHECKLIST_ITEMS = [
  "CV/Resume",
  "Statement of Purpose",
  "Recommendation Letters",
  "Transcripts",
  "English Test (TOEFL/IELTS)",
  "Scholarship Application",
];
