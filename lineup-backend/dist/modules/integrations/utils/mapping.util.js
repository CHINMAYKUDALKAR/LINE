"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMapping = applyMapping;
exports.reverseMapping = reverseMapping;
exports.mergeMappings = mergeMappings;
exports.validateMapping = validateMapping;
function applyMapping(source, mappingConfig) {
    const result = {};
    for (const mapping of mappingConfig.mappings) {
        const sourceValue = source[mapping.sourceField];
        if (sourceValue === undefined || sourceValue === null) {
            continue;
        }
        let transformedValue = sourceValue;
        if (mapping.transform && typeof sourceValue === 'string') {
            switch (mapping.transform) {
                case 'uppercase':
                    transformedValue = sourceValue.toUpperCase();
                    break;
                case 'lowercase':
                    transformedValue = sourceValue.toLowerCase();
                    break;
                case 'trim':
                    transformedValue = sourceValue.trim();
                    break;
                case 'none':
                default:
                    transformedValue = sourceValue;
            }
        }
        result[mapping.targetField] = transformedValue;
    }
    return result;
}
function reverseMapping(target, mappingConfig) {
    const result = {};
    for (const mapping of mappingConfig.mappings) {
        const targetValue = target[mapping.targetField];
        if (targetValue === undefined || targetValue === null) {
            continue;
        }
        result[mapping.sourceField] = targetValue;
    }
    return result;
}
function mergeMappings(existing, updates) {
    const mergedMappings = [...existing.mappings];
    for (const update of updates.mappings) {
        const existingIndex = mergedMappings.findIndex((m) => m.sourceField === update.sourceField);
        if (existingIndex >= 0) {
            mergedMappings[existingIndex] = update;
        }
        else {
            mergedMappings.push(update);
        }
    }
    return {
        mappings: mergedMappings,
        direction: updates.direction || existing.direction,
    };
}
function validateMapping(mappingConfig) {
    if (!mappingConfig.mappings || !Array.isArray(mappingConfig.mappings)) {
        return false;
    }
    for (const mapping of mappingConfig.mappings) {
        if (!mapping.sourceField || !mapping.targetField) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=mapping.util.js.map