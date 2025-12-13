export declare class SyncRequestDto {
    tenantId: string;
    provider: string;
    action: 'pull' | 'push' | 'webhook';
    payload?: any;
}
