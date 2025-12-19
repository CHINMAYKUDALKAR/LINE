import { PrismaService } from './prisma.service';
interface HealthStatus {
    status: 'ok' | 'degraded' | 'unhealthy';
    timestamp: string;
    version?: string;
    uptime?: number;
}
interface ReadinessStatus extends HealthStatus {
    checks: {
        database: {
            status: 'ok' | 'error';
            latencyMs?: number;
            error?: string;
        };
        redis: {
            status: 'ok' | 'error';
            error?: string;
        };
    };
}
export declare class HealthController {
    private prisma;
    private readonly startTime;
    constructor(prisma: PrismaService);
    check(): HealthStatus;
    liveness(): {
        status: 'ok';
        timestamp: string;
    };
    readiness(): Promise<ReadinessStatus>;
    details(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        uptime: number;
        environment: string;
        checks: {
            database: {
                status: "ok" | "error";
                latencyMs?: number;
                error?: string;
            };
            redis: {
                status: "ok" | "error";
                error?: string;
            };
        };
        system: {
            memory: {
                heapUsed: string;
                heapTotal: string;
                rss: string;
            };
            nodeVersion: string;
            pid: number;
        };
    }>;
    private checkDatabase;
    private checkRedis;
}
export {};
