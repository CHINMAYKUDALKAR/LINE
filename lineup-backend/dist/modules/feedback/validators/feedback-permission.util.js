"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureInterviewerCanSubmit = ensureInterviewerCanSubmit;
const common_1 = require("@nestjs/common");
function ensureInterviewerCanSubmit(interview, userId) {
    if (!interview.interviewerIds.includes(userId)) {
        throw new common_1.ForbiddenException('User not assigned as interviewer');
    }
    if (interview.status === 'CANCELLED') {
        throw new common_1.ForbiddenException('Cannot submit feedback on cancelled interview');
    }
}
//# sourceMappingURL=feedback-permission.util.js.map