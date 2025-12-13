"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityUtil = void 0;
class AvailabilityUtil {
    static rangesOverlap(startA, endA, startB, endB) {
        return startA < endB && endA > startB;
    }
    static parseDate(iso) {
        return new Date(iso);
    }
}
exports.AvailabilityUtil = AvailabilityUtil;
//# sourceMappingURL=availability.util.js.map