/**
 * HubSpot Field Mapping Configuration
 *
 * Defines fixed mappings between Lineup entities and HubSpot CRM objects.
 * v1: No UI configuration - these are hardcoded defaults.
 */

/**
 * Lineup Candidate → HubSpot Contact field mapping
 */
export const HUBSPOT_CONTACT_MAPPING = {
    // Required fields
    email: 'email',

    // Name fields (HubSpot splits first/last)
    // Handled programmatically by splitting Lineup's single 'name' field
    firstName: 'firstname',
    lastName: 'lastname',

    // Optional fields
    phone: 'phone',
    roleTitle: 'jobtitle',
    source: 'leadsource',
    stage: 'hs_lead_status',
} as const;

/**
 * Lineup Job/Requisition → HubSpot Deal field mapping
 */
export const HUBSPOT_DEAL_MAPPING = {
    title: 'dealname',
    description: 'description',
    stage: 'dealstage',
    // Note: HubSpot deals require a pipeline - default is 'default'
} as const;

/**
 * Map Lineup candidate stages to HubSpot lead statuses
 */
export const LINEUP_STAGE_TO_HUBSPOT_STATUS: Record<string, string> = {
    // Initial stages
    'applied': 'NEW',
    'new': 'NEW',
    'sourced': 'NEW',

    // Active stages
    'screening': 'OPEN',
    'phone_screen': 'OPEN',
    'interview': 'IN_PROGRESS',
    'technical': 'IN_PROGRESS',
    'onsite': 'IN_PROGRESS',

    // Decision stages
    'offer': 'QUALIFIED',
    'offer_extended': 'QUALIFIED',
    'negotiation': 'QUALIFIED',

    // Final stages
    'hired': 'CUSTOMER',
    'accepted': 'CUSTOMER',

    // Negative outcomes
    'rejected': 'BAD_TIMING',
    'declined': 'BAD_TIMING',
    'withdrawn': 'BAD_TIMING',
    'no_show': 'BAD_TIMING',
};

/**
 * Get HubSpot lead status from Lineup stage
 */
export function mapStageToHubspotStatus(lineupStage: string): string {
    const normalized = lineupStage.toLowerCase().replace(/[\s-]/g, '_');
    return LINEUP_STAGE_TO_HUBSPOT_STATUS[normalized] || 'NEW';
}

/**
 * Split a full name into first and last name components
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 0 || !parts[0]) {
        return { firstName: 'Unknown', lastName: '' };
    }

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
    };
}

/**
 * Map a Lineup candidate to HubSpot Contact properties
 */
export function mapCandidateToContact(candidate: {
    name: string;
    email?: string | null;
    phone?: string | null;
    roleTitle?: string | null;
    source?: string | null;
    stage?: string | null;
}): Record<string, string> {
    const { firstName, lastName } = splitName(candidate.name);

    return {
        firstname: firstName,
        lastname: lastName,
        email: candidate.email || '',
        phone: candidate.phone || '',
        jobtitle: candidate.roleTitle || '',
        leadsource: candidate.source || 'Lineup',
        hs_lead_status: candidate.stage ? mapStageToHubspotStatus(candidate.stage) : 'NEW',
    };
}

/**
 * Format interview as HubSpot meeting title
 */
export function formatInterviewTitle(
    candidateName: string,
    stage?: string,
): string {
    const stageText = stage ? ` - ${stage}` : '';
    return `Interview: ${candidateName}${stageText}`;
}

/**
 * Format interview as HubSpot meeting body
 */
export function formatInterviewBody(interview: {
    stage?: string | null;
    notes?: string | null;
    status?: string;
    interviewerNames?: string[];
}): string {
    const lines: string[] = ['📋 Lineup Interview'];

    if (interview.stage) {
        lines.push(`Stage: ${interview.stage}`);
    }

    if (interview.status) {
        lines.push(`Status: ${interview.status}`);
    }

    if (interview.interviewerNames && interview.interviewerNames.length > 0) {
        lines.push(`Interviewers: ${interview.interviewerNames.join(', ')}`);
    }

    if (interview.notes) {
        lines.push(`\nNotes:\n${interview.notes}`);
    }

    return lines.join('\n');
}

/**
 * Map interview status to HubSpot meeting outcome
 */
export function mapInterviewStatusToOutcome(status: string): string {
    const statusMap: Record<string, string> = {
        'SCHEDULED': 'SCHEDULED',
        'RESCHEDULED': 'RESCHEDULED',
        'COMPLETED': 'COMPLETED',
        'CANCELLED': 'CANCELED',
        'NO_SHOW': 'NO_SHOW',
    };

    return statusMap[status.toUpperCase()] || 'SCHEDULED';
}
