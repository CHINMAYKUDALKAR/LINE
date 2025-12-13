import { TimeInterval } from '../types/calendar.types';
export declare function sortIntervals(intervals: TimeInterval[]): TimeInterval[];
export declare function mergeIntervals(intervals: TimeInterval[]): TimeInterval[];
export declare function subtractIntervals(available: TimeInterval[], busy: TimeInterval[]): TimeInterval[];
export declare function intersectIntervalLists(lists: TimeInterval[][]): TimeInterval[];
export declare function sliceIntoSlots(intervals: TimeInterval[], durationMins: number, alignToHour?: boolean): TimeInterval[];
export declare function applyBuffers(intervals: TimeInterval[], bufferBeforeMins: number, bufferAfterMins: number): TimeInterval[];
export declare function filterByMinNotice(slots: TimeInterval[], minNoticeMins: number, now?: Date): TimeInterval[];
