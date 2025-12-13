export function ensureInterviewerCanSubmit(interview: any, userId: string) {
    if (!interview.interviewerIds.includes(userId)) {
        throw new Error('User not assigned as interviewer');
    }
    if (interview.status === 'CANCELLED') { // Updated to match schema uppercase enum style if used, or string
        throw new Error('Cannot submit feedback on cancelled interview');
    }
}
