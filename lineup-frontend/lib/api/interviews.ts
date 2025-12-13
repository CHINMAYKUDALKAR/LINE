import { client } from './client';

// =============================================================================
// Types
// =============================================================================

export interface Interview {
    id: string;
    tenantId: string;
    candidateId: string;
    candidateName?: string;
    candidateEmail?: string;
    candidatePhone?: string;
    roleTitle?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    durationMins: number;
    stage: string;
    status: string;
    type: string;
    location?: string;
    meetingLink?: string;
    interviewers: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InterviewListResponse {
    data: Interview[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get all interviews with filtering
 */
export async function getInterviews(params?: {
    page?: number;
    perPage?: number;
    date?: string;
    status?: string;
    candidateId?: string;
}): Promise<InterviewListResponse> {
    try {
        const response = await client.get<InterviewListResponse>('/interviews', {
            params: params as Record<string, string | number | boolean | undefined | null>,
        });
        return response;
    } catch (error) {
        console.error('Failed to fetch interviews:', error);
        throw error;
    }
}

/**
 * Get a specific interview by ID
 */
export async function getInterview(id: string): Promise<Interview> {
    try {
        const response = await client.get<Interview>(`/interviews/${id}`);
        return response;
    } catch (error) {
        console.error(`Failed to fetch interview ${id}:`, error);
        throw error;
    }
}

/**
 * Create a new interview
 */
export async function createInterview(data: {
    candidateId: string;
    date: string;
    startTime?: string;
    durationMins?: number;
    stage?: string;
    type?: string;
    location?: string;
    meetingLink?: string;
    interviewerIds?: string[];
    notes?: string;
}): Promise<Interview> {
    try {
        const response = await client.post<Interview>('/interviews', data);
        return response;
    } catch (error) {
        console.error('Failed to create interview:', error);
        throw error;
    }
}

/**
 * Reschedule an interview
 */
export async function rescheduleInterview(
    id: string,
    data: {
        newDate: string;
        newStartTime?: string;
        reason?: string;
    }
): Promise<Interview> {
    try {
        const response = await client.post<Interview>(`/interviews/reschedule/${id}`, {
            interviewId: id,
            ...data,
        });
        return response;
    } catch (error) {
        console.error(`Failed to reschedule interview ${id}:`, error);
        throw error;
    }
}

/**
 * Cancel an interview
 */
export async function cancelInterview(id: string): Promise<{ success: boolean }> {
    try {
        const response = await client.post<{ success: boolean }>(`/interviews/${id}/cancel`);
        return response;
    } catch (error) {
        console.error(`Failed to cancel interview ${id}:`, error);
        throw error;
    }
}

/**
 * Mark interview as complete
 */
export async function completeInterview(id: string): Promise<Interview> {
    try {
        const response = await client.post<Interview>(`/interviews/${id}/complete`);
        return response;
    } catch (error) {
        console.error(`Failed to complete interview ${id}:`, error);
        throw error;
    }
}
