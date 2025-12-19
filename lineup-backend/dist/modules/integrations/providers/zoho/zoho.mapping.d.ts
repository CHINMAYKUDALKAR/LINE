import { MappingConfig } from '../../types/mapping.interface';
export type ZohoModule = 'Contacts' | 'Leads';
export declare const STAGE_TO_ZOHO_STATUS: Record<string, string>;
export declare const INTERVIEW_STATUS_TO_ACTIVITY: Record<string, string>;
export declare const ZOHO_CONTACT_MAPPING: MappingConfig;
export declare const ZOHO_LEAD_MAPPING: MappingConfig;
export declare function getZohoMapping(tenantSettings?: any): MappingConfig;
export declare function getZohoModule(tenantSettings?: any): ZohoModule;
export declare function mapStageToZohoStatus(stage: string): string;
export declare function createInterviewActivity(interview: {
    candidateName: string;
    interviewerName?: string;
    scheduledAt: Date;
    duration?: number;
    type?: string;
    notes?: string;
    status?: string;
}): {
    Subject: string;
    Activity_Type: string;
    Start_DateTime: string;
    End_DateTime: string;
    Description: string;
    Status: string;
};
