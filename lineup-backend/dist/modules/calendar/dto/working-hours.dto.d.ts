export declare class WeeklyPatternDto {
    dow: number;
    start: string;
    end: string;
}
export declare class SetWorkingHoursDto {
    userId?: string;
    weekly: WeeklyPatternDto[];
    timezone: string;
    effectiveFrom?: string;
    effectiveTo?: string;
}
