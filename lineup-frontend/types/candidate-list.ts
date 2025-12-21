import { InterviewStage } from './interview';

export interface CandidateListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  stage: InterviewStage;
  source: string;
  recruiterName: string;
  recruiterId: string;
  lastActivity: string;
  lastActivityType: 'interview' | 'email' | 'note' | 'stage-change' | 'created';
  dateAdded: string;
  skills: string[];
  experienceYears: number;
  tenantId: string;
}

export interface CandidateListFilters {
  search: string;
  role: string;
  stage: InterviewStage | 'all';
  source: string | 'all';
  recruiterId: string | 'all';
  experienceMin: number | null;
  experienceMax: number | null;
  dateAddedFrom: Date | null;
  dateAddedTo: Date | null;
}

export type CandidateBulkAction = 'change-stage' | 'send-email' | 'add-tag' | 'assign-recruiter' | 'delete' | 'email' | 'schedule' | 'sms';
