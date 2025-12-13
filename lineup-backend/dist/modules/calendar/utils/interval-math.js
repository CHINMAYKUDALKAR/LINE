"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortIntervals = sortIntervals;
exports.mergeIntervals = mergeIntervals;
exports.subtractIntervals = subtractIntervals;
exports.intersectIntervalLists = intersectIntervalLists;
exports.sliceIntoSlots = sliceIntoSlots;
exports.applyBuffers = applyBuffers;
exports.filterByMinNotice = filterByMinNotice;
function sortIntervals(intervals) {
    return [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
}
function mergeIntervals(intervals) {
    if (intervals.length === 0)
        return [];
    const sorted = sortIntervals(intervals);
    const merged = [{ ...sorted[0] }];
    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const last = merged[merged.length - 1];
        if (current.start.getTime() <= last.end.getTime()) {
            last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
        }
        else {
            merged.push({ ...current });
        }
    }
    return merged;
}
function subtractIntervals(available, busy) {
    if (available.length === 0)
        return [];
    if (busy.length === 0)
        return available.map((i) => ({ ...i }));
    const sortedAvailable = sortIntervals(available);
    const sortedBusy = mergeIntervals(busy);
    const result = [];
    for (const avail of sortedAvailable) {
        let remaining = [{ ...avail }];
        for (const block of sortedBusy) {
            const nextRemaining = [];
            for (const interval of remaining) {
                if (block.end.getTime() <= interval.start.getTime() ||
                    block.start.getTime() >= interval.end.getTime()) {
                    nextRemaining.push(interval);
                    continue;
                }
                if (block.start.getTime() > interval.start.getTime()) {
                    nextRemaining.push({
                        start: interval.start,
                        end: new Date(Math.min(block.start.getTime(), interval.end.getTime())),
                    });
                }
                if (block.end.getTime() < interval.end.getTime()) {
                    nextRemaining.push({
                        start: new Date(Math.max(block.end.getTime(), interval.start.getTime())),
                        end: interval.end,
                    });
                }
            }
            remaining = nextRemaining;
        }
        result.push(...remaining);
    }
    return result.filter((i) => i.end.getTime() > i.start.getTime());
}
function intersectIntervalLists(lists) {
    if (lists.length === 0)
        return [];
    if (lists.length === 1)
        return lists[0].map((i) => ({ ...i }));
    let result = lists[0].map((i) => ({ ...i }));
    for (let i = 1; i < lists.length; i++) {
        result = intersectTwoLists(result, lists[i]);
        if (result.length === 0)
            break;
    }
    return result;
}
function intersectTwoLists(a, b) {
    const result = [];
    const sortedA = sortIntervals(a);
    const sortedB = sortIntervals(b);
    let i = 0, j = 0;
    while (i < sortedA.length && j < sortedB.length) {
        const intervalA = sortedA[i];
        const intervalB = sortedB[j];
        const start = new Date(Math.max(intervalA.start.getTime(), intervalB.start.getTime()));
        const end = new Date(Math.min(intervalA.end.getTime(), intervalB.end.getTime()));
        if (start.getTime() < end.getTime()) {
            result.push({ start, end });
        }
        if (intervalA.end.getTime() < intervalB.end.getTime()) {
            i++;
        }
        else {
            j++;
        }
    }
    return result;
}
function sliceIntoSlots(intervals, durationMins, alignToHour = true) {
    const slots = [];
    const durationMs = durationMins * 60 * 1000;
    for (const interval of intervals) {
        let slotStart = new Date(interval.start);
        if (alignToHour) {
            const mins = slotStart.getMinutes();
            if (mins !== 0 && mins !== 30) {
                const alignTo = mins < 30 ? 30 : 60;
                slotStart = new Date(slotStart);
                slotStart.setMinutes(alignTo === 60 ? 0 : 30, 0, 0);
                if (alignTo === 60) {
                    slotStart.setHours(slotStart.getHours() + 1);
                }
            }
        }
        while (slotStart.getTime() + durationMs <= interval.end.getTime()) {
            slots.push({
                start: new Date(slotStart),
                end: new Date(slotStart.getTime() + durationMs),
            });
            slotStart = new Date(slotStart.getTime() + durationMs);
        }
    }
    return slots;
}
function applyBuffers(intervals, bufferBeforeMins, bufferAfterMins) {
    const bufferBeforeMs = bufferBeforeMins * 60 * 1000;
    const bufferAfterMs = bufferAfterMins * 60 * 1000;
    return intervals
        .map((interval) => ({
        start: new Date(interval.start.getTime() + bufferBeforeMs),
        end: new Date(interval.end.getTime() - bufferAfterMs),
    }))
        .filter((i) => i.end.getTime() > i.start.getTime());
}
function filterByMinNotice(slots, minNoticeMins, now = new Date()) {
    const minStartTime = new Date(now.getTime() + minNoticeMins * 60 * 1000);
    return slots.filter((slot) => slot.start.getTime() >= minStartTime.getTime());
}
//# sourceMappingURL=interval-math.js.map