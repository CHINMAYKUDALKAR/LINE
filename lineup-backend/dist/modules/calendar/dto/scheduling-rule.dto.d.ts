export declare class CreateSchedulingRuleDto {
    name: string;
    minNoticeMins?: number;
    bufferBeforeMins?: number;
    bufferAfterMins?: number;
    defaultSlotMins?: number;
    allowOverlapping?: boolean;
    isDefault?: boolean;
}
export declare class UpdateSchedulingRuleDto {
    name?: string;
    minNoticeMins?: number;
    bufferBeforeMins?: number;
    bufferAfterMins?: number;
    defaultSlotMins?: number;
    allowOverlapping?: boolean;
    isDefault?: boolean;
}
