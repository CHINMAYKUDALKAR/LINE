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
exports.ZohoFieldMapService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let ZohoFieldMapService = class ZohoFieldMapService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveMapping(tenantId, module, mapping) {
        const integ = await this.prisma.integration.findUnique({
            where: { tenantId_provider: { tenantId, provider: 'zoho' } },
        });
        const currentSettings = integ?.settings || {};
        const currentMapping = currentSettings.mapping || {};
        await this.prisma.integration.updateMany({
            where: { tenantId, provider: 'zoho' },
            data: {
                settings: {
                    ...currentSettings,
                    mapping: { ...currentMapping, [module]: mapping }
                }
            }
        });
    }
    async getMapping(tenantId, module) {
        const integ = await this.prisma.integration.findUnique({
            where: { tenantId_provider: { tenantId, provider: 'zoho' } },
        });
        const settings = integ?.settings;
        const mapping = settings?.mapping;
        return mapping?.[module] || null;
    }
};
exports.ZohoFieldMapService = ZohoFieldMapService;
exports.ZohoFieldMapService = ZohoFieldMapService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZohoFieldMapService);
//# sourceMappingURL=zoho.fieldmap.service.js.map