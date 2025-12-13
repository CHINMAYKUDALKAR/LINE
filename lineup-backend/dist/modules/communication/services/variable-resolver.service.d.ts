import { PrismaService } from '../../../common/prisma.service';
export interface ResolvedVariables {
    candidate: {
        name: string;
        email: string;
        phone?: string;
    };
    interviewer: {
        name: string;
        email: string;
    };
    interview: {
        id: string;
        date: string;
        time: string;
        duration: number;
        stage: string;
        link?: string;
    };
    company: {
        name: string;
    };
}
export declare class VariableResolverService {
    private prisma;
    constructor(prisma: PrismaService);
    resolveForInterview(tenantId: string, interviewId: string, interviewerId?: string): Promise<ResolvedVariables>;
    flatten(vars: ResolvedVariables): Record<string, any>;
}
