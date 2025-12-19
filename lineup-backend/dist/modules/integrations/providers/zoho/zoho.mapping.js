"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZOHO_LEAD_MAPPING = exports.ZOHO_CONTACT_MAPPING = exports.INTERVIEW_STATUS_TO_ACTIVITY = exports.STAGE_TO_ZOHO_STATUS = void 0;
exports.getZohoMapping = getZohoMapping;
exports.getZohoModule = getZohoModule;
exports.mapStageToZohoStatus = mapStageToZohoStatus;
exports.createInterviewActivity = createInterviewActivity;
exports.STAGE_TO_ZOHO_STATUS = {
    'New': 'Attempted to Contact',
    'Screening': 'Contact in Future',
    'Phone Screen': 'Contacted',
    'Interview': 'Contacted',
    'Technical': 'Contacted',
    'Onsite': 'Contacted',
    'Offer': 'Qualified',
    'Hired': 'Closed Won',
    'Rejected': 'Closed Lost',
    'Withdrawn': 'Closed Lost',
    'On Hold': 'Not Contacted',
};
exports.INTERVIEW_STATUS_TO_ACTIVITY = {
    'scheduled': 'Planned',
    'confirmed': 'Planned',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no_show': 'Cancelled',
};
exports.ZOHO_CONTACT_MAPPING = {
    mappings: [
        {
            sourceField: 'name',
            targetField: 'Full_Name',
            transform: 'none',
        },
        {
            sourceField: 'firstName',
            targetField: 'First_Name',
            transform: 'none',
        },
        {
            sourceField: 'lastName',
            targetField: 'Last_Name',
            transform: 'none',
        },
        {
            sourceField: 'email',
            targetField: 'Email',
            transform: 'lowercase',
        },
        {
            sourceField: 'phone',
            targetField: 'Phone',
            transform: 'none',
        },
        {
            sourceField: 'roleTitle',
            targetField: 'Title',
            transform: 'none',
        },
        {
            sourceField: 'currentCompany',
            targetField: 'Account_Name',
            transform: 'none',
        },
        {
            sourceField: 'location',
            targetField: 'Mailing_City',
            transform: 'none',
        },
        {
            sourceField: 'source',
            targetField: 'Lead_Source',
            transform: 'none',
        },
        {
            sourceField: 'linkedinUrl',
            targetField: 'LinkedIn_URL',
            transform: 'none',
        },
    ],
    direction: 'outbound',
};
exports.ZOHO_LEAD_MAPPING = {
    mappings: [
        {
            sourceField: 'name',
            targetField: 'Full_Name',
            transform: 'none',
        },
        {
            sourceField: 'firstName',
            targetField: 'First_Name',
            transform: 'none',
        },
        {
            sourceField: 'lastName',
            targetField: 'Last_Name',
            transform: 'none',
        },
        {
            sourceField: 'email',
            targetField: 'Email',
            transform: 'lowercase',
        },
        {
            sourceField: 'phone',
            targetField: 'Phone',
            transform: 'none',
        },
        {
            sourceField: 'roleTitle',
            targetField: 'Designation',
            transform: 'none',
        },
        {
            sourceField: 'currentCompany',
            targetField: 'Company',
            transform: 'none',
        },
        {
            sourceField: 'source',
            targetField: 'Lead_Source',
            transform: 'none',
        },
        {
            sourceField: 'stage',
            targetField: 'Lead_Status',
            transform: 'custom',
        },
    ],
    direction: 'outbound',
};
function getZohoMapping(tenantSettings) {
    if (tenantSettings?.mapping) {
        return tenantSettings.mapping;
    }
    const targetModule = tenantSettings?.zohoModule || 'Contacts';
    return targetModule === 'Leads' ? exports.ZOHO_LEAD_MAPPING : exports.ZOHO_CONTACT_MAPPING;
}
function getZohoModule(tenantSettings) {
    return tenantSettings?.zohoModule || 'Contacts';
}
function mapStageToZohoStatus(stage) {
    return exports.STAGE_TO_ZOHO_STATUS[stage] || 'Not Contacted';
}
function createInterviewActivity(interview) {
    return {
        Subject: `Interview: ${interview.candidateName}`,
        Activity_Type: 'Meeting',
        Start_DateTime: interview.scheduledAt.toISOString(),
        End_DateTime: interview.duration
            ? new Date(interview.scheduledAt.getTime() + interview.duration * 60000).toISOString()
            : new Date(interview.scheduledAt.getTime() + 60 * 60000).toISOString(),
        Description: [
            `Candidate: ${interview.candidateName}`,
            interview.interviewerName ? `Interviewer: ${interview.interviewerName}` : '',
            interview.type ? `Type: ${interview.type}` : '',
            interview.notes ? `Notes: ${interview.notes}` : '',
        ].filter(Boolean).join('\n'),
        Status: exports.INTERVIEW_STATUS_TO_ACTIVITY[interview.status || 'scheduled'] || 'Planned',
    };
}
//# sourceMappingURL=zoho.mapping.js.map