import { EmailService } from './email.service';
export declare class EmailController {
    private svc;
    constructor(svc: EmailService);
    preview(body: {
        template: string;
        context: any;
    }): {
        subject: string;
        body: string;
    };
    sendTest(req: any, body: {
        to: string;
        template: string;
        context: any;
    }): Promise<import("bullmq").Job<any, any, string>>;
}
