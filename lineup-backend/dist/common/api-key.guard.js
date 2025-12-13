"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const api_key_util_1 = require("../modules/settings/utils/api-key.util");
let ApiKeyGuard = class ApiKeyGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const header = req.headers['x-api-key'];
        if (!header)
            return true;
        if (header.includes(':')) {
            const [id, secret] = header.split(':');
            const keyRec = await this.prisma.aPIKey.findUnique({ where: { id } });
            if (keyRec && keyRec.active) {
                const valid = await (0, api_key_util_1.verifyApiKey)(secret, keyRec.hashedKey);
                if (valid) {
                    req.apiKey = { id: keyRec.id, scopes: keyRec.scopes, tenantId: keyRec.tenantId };
                    return true;
                }
            }
        }
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map