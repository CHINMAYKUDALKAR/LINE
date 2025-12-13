import { PrismaService } from '../../common/prisma.service';
export declare class EmailService {
    private prisma;
    private queue;
    constructor(prisma: PrismaService);
    enqueue(tenantId: string | null, payload: {
        to: string;
        template: string;
        context: any;
        attachments?: any[];
    }): Promise<import("bullmq").Job<any, any, string>>;
    sendMail(tenantId: string | null, opts: {
        to: string;
        template: string;
        context: any;
        attachments?: any[];
    }): Promise<import("@aws-sdk/client-ses").SendEmailCommandOutput | import("nodemailer/lib/smtp-transport").SentMessageInfo>;
    smtpFromSettings(smtp: any): {
        host: any;
        port: any;
        secure: any;
        auth: {
            user: any;
            pass: any;
        } | undefined;
        from: any;
    };
    globalSmtp(): {
        type: string;
        region: string | undefined;
        from: string | undefined;
        host?: undefined;
        port?: undefined;
        secure?: undefined;
        auth?: undefined;
    } | {
        host: string;
        port: string | undefined;
        secure: boolean;
        auth: {
            user: string | undefined;
            pass: string | undefined;
        } | undefined;
        from: string | undefined;
        type?: undefined;
        region?: undefined;
    } | null;
    sendOnboardingEmail(tenantId: string, to: string, name: string, tenantName: string, setupPayload: any): Promise<import("bullmq").Job<any, any, string>>;
    previewTemplate(template: string, context: any): {
        subject: string;
        body: string;
    };
}
