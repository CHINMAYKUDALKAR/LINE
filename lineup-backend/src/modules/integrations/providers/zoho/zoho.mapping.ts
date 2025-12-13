import { MappingConfig } from '../../types/mapping.interface';

/**
 * Default field mappings for Zoho CRM Contacts
 */
export const DEFAULT_ZOHO_MAPPING: MappingConfig = {
    mappings: [
        {
            sourceField: 'name',
            targetField: 'Full_Name',
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
    ],
    direction: 'bidirectional',
};

/**
 * Get mapping configuration for a tenant (with fallback to default)
 */
export function getZohoMapping(tenantSettings?: any): MappingConfig {
    if (tenantSettings?.mapping) {
        return tenantSettings.mapping;
    }
    return DEFAULT_ZOHO_MAPPING;
}
