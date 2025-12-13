declare class FieldMappingDto {
    sourceField: string;
    targetField: string;
    transform?: 'uppercase' | 'lowercase' | 'trim' | 'none';
}
export declare class UpdateMappingDto {
    provider: string;
    mappings: FieldMappingDto[];
    direction?: 'push' | 'pull' | 'bidirectional';
}
export {};
