export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  stage: string;
  hasResume: boolean;
  priorInterviews: number;
  appliedDate: string;
  // Interview scheduling conflict fields
  hasActiveInterview?: boolean;
  activeInterviewId?: string;
  activeInterviewDate?: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl?: string;
  availability: 'available' | 'busy' | 'partial';
}

export interface TimeSlot {
  time: string;
  available: boolean;
  recommended?: boolean;
}

export interface ScheduleInterviewPayload {
  tenantId: string;
  candidateIds: string[];
  interviewerIds: string[];
  interviewMode: 'online' | 'offline' | 'phone';
  date: string;
  startTime: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  notifications: {
    emailCandidate: boolean;
    emailInterviewers: boolean;
    smsReminder: boolean;
  };
  notes?: string;
}
