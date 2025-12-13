export declare class CalendarConnectDto {
    redirectUri: string;
}
export declare class CalendarCallbackDto {
    code: string;
    redirectUri: string;
}
export declare class CalendarAccountDto {
    id: string;
    provider: string;
    providerAccountId: string;
    syncEnabled: boolean;
    lastSyncAt: Date | null;
}
export declare class ToggleSyncDto {
    enabled: boolean;
}
export declare class SyncResultDto {
    success: boolean;
    eventsProcessed: number;
}
export declare class AuthUrlResponseDto {
    authUrl: string;
}
export declare class ConnectedAccountsResponseDto {
    accounts: CalendarAccountDto[];
}
