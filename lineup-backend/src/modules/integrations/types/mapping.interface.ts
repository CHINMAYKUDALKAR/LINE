export interface FieldMapping {
    sourceField: string;
    targetField: string;
    transform?: 'uppercase' | 'lowercase' | 'trim' | 'none';
}

export interface MappingConfig {
    mappings: FieldMapping[];
    direction?: 'push' | 'pull' | 'bidirectional';
}
