import { MappingConfig } from '../types/mapping.interface';
export declare function applyMapping(source: Record<string, any>, mappingConfig: MappingConfig): Record<string, any>;
export declare function reverseMapping(target: Record<string, any>, mappingConfig: MappingConfig): Record<string, any>;
export declare function mergeMappings(existing: MappingConfig, updates: MappingConfig): MappingConfig;
export declare function validateMapping(mappingConfig: MappingConfig): boolean;
