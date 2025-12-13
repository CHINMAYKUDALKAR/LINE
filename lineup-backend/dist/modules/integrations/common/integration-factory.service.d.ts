import { SalesforceService } from '../providers/salesforce/salesforce.service';
import { HubspotService } from '../providers/hubspot/hubspot.service';
import { WorkdayService } from '../providers/workday/workday.service';
import { IntegrationConnector } from './integration.interface';
export declare class IntegrationFactory {
    private salesforce;
    private hubspot;
    private workday;
    constructor(salesforce: SalesforceService, hubspot: HubspotService, workday: WorkdayService);
    getConnector(provider: string): IntegrationConnector;
}
