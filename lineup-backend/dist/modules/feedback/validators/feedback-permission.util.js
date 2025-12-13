"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureInterviewerCanSubmit = ensureInterviewerCanSubmit;
function ensureInterviewerCanSubmit(interview, userId) {
    if (!interview.interviewerIds.includes(userId)) {
        throw new Error('User not assigned as interviewer');
    }
    if (interview.status === 'CANCELLED') {
        throw new Error('Cannot submit feedback on cancelled interview');
    }
}
//# sourceMappingURL=feedback-permission.util.js.map