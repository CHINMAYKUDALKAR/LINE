"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ZOHO_MAPPING = void 0;
exports.getZohoMapping = getZohoMapping;
exports.DEFAULT_ZOHO_MAPPING = {
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
function getZohoMapping(tenantSettings) {
    if (tenantSettings?.mapping) {
        return tenantSettings.mapping;
    }
    return exports.DEFAULT_ZOHO_MAPPING;
}
//# sourceMappingURL=zoho.mapping.js.map