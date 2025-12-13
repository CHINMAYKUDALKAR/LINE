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
exports.IntegrationFactory = void 0;
const common_1 = require("@nestjs/common");
const salesforce_service_1 = require("../providers/salesforce/salesforce.service");
const hubspot_service_1 = require("../providers/hubspot/hubspot.service");
const workday_service_1 = require("../providers/workday/workday.service");
let IntegrationFactory = class IntegrationFactory {
    salesforce;
    hubspot;
    workday;
    constructor(salesforce, hubspot, workday) {
        this.salesforce = salesforce;
        this.hubspot = hubspot;
        this.workday = workday;
    }
    getConnector(provider) {
        switch (provider) {
            case 'salesforce': return this.salesforce;
            case 'hubspot': return this.hubspot;
            case 'workday': return this.workday;
            default: throw new Error(`Unsupported provider: ${provider}`);
        }
    }
};
exports.IntegrationFactory = IntegrationFactory;
exports.IntegrationFactory = IntegrationFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [salesforce_service_1.SalesforceService,
        hubspot_service_1.HubspotService,
        workday_service_1.WorkdayService])
], IntegrationFactory);
//# sourceMappingURL=integration-factory.service.js.map