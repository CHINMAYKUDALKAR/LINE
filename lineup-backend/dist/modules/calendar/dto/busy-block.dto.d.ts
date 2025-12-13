export declare class CreateBusyBlockDto {
    userId?: string;
    startAt: string;
    endAt: string;
    reason?: string;
    metadata?: Record<string, any>;
}
export declare class BusyBlockQueryDto {
    userId?: string;
    start?: string;
    end?: string;
    source?: string;
}
