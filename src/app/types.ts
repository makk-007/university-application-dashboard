export type ApplicationStatus =
  | "not-yet-open"
  | "not-started"
  | "in-progress"
  | "submitted"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "awarded"
  | "withdrawn";

export interface ApplicationCycle {
  id: string;
  name: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt?: string;
}

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
  cycleId: string | null;
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
  cycleId: string | null;
  name: string;
  status: ApplicationStatus;
  amount: number;
  currency: string;
  coverage:
    | "Full Scholarship"
    | "Tuition Only"
    | "Stipend Only"
    | "Tuition + Stipend";
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

// Exchange rates to GHS. Last updated: June 2026.
// These are approximate mid-market rates - actual conversion will vary.
export const FX_TO_GHS: Record<string, number> = {
  USD: 13.5,
  EUR: 14.8,
  GBP: 17.2,
  SEK: 1.25,
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

export const DEFAULT_SCHOLARSHIP_CHECKLIST_ITEMS = [
  "CV/Resume",
  "Scholarship Essay",
  "Recommendation Letters",
  "Transcripts",
  "Proof of Admission/Enrollment",
];
