
const fs = require('fs');
const path = require('path');

const baseDir = '/Users/chinmayk/Desktop/lineup/lineup-backend';

const files = [
    // Common
    ['src/common/prisma.service.ts', 'import { Injectable, OnModuleInit } from "@nestjs/common";\nimport { PrismaClient } from "@prisma/client";\n\n@Injectable()\nexport class PrismaService extends PrismaClient implements OnModuleInit {\n  async onModuleInit() {\n    await this.$connect();\n  }\n}'],
    ['src/common/tenant.middleware.ts', 'import { Injectable, NestMiddleware } from "@nestjs/common";\n\n@Injectable()\nexport class TenantMiddleware implements NestMiddleware {\n  use(req: any, res: any, next: () => void) {\n    next();\n  }\n}'],
    ['src/common/auth.guard.ts', 'import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";\n\n@Injectable()\nexport class AuthGuard implements CanActivate {\n  canActivate(context: ExecutionContext): boolean {\n    return true;\n  }\n}'],
    ['src/common/rbac.guard.ts', 'import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";\n\n@Injectable()\nexport class RbacGuard implements CanActivate {\n  canActivate(context: ExecutionContext): boolean {\n    return true;\n  }\n}'],
    ['src/common/roles.decorator.ts', 'import { SetMetadata } from "@nestjs/common";\n\nexport const Roles = (...roles: string[]) => SetMetadata("roles", roles);'],
    ['src/common/logging.interceptor.ts', 'import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";\nimport { Observable } from "rxjs";\n\n@Injectable()\nexport class LoggingInterceptor implements NestInterceptor {\n  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n    return next.handle();\n  }\n}'],
    ['src/common/exceptions.filter.ts', 'import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";\n\n@Catch(HttpException)\nexport class HttpExceptionFilter implements ExceptionFilter {\n  catch(exception: HttpException, host: ArgumentsHost) {\n    // Implementation\n  }\n}'],

    // Auth
    ['src/modules/auth/auth.module.ts', 'import { Module } from "@nestjs/common";\nimport { AuthService } from "./auth.service";\n\n@Module({\n  providers: [AuthService],\n  exports: [AuthService]\n})\nexport class AuthModule {}'],
    ['src/modules/auth/auth.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class AuthService {}'],
    ['src/modules/auth/jwt.strategy.ts', 'import { Injectable } from "@nestjs/common";\nimport { PassportStrategy } from "@nestjs/passport";\nimport { ExtractJwt, Strategy } from "passport-jwt";\n\n@Injectable()\nexport class JwtStrategy extends PassportStrategy(Strategy) {\n  constructor() {\n    super({\n      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),\n      ignoreExpiration: false,\n      secretOrKey: "secret",\n    });\n  }\n\n  async validate(payload: any) {\n    return { userId: payload.sub, username: payload.username };\n  }\n}'],

    // Tenants
    ['src/modules/tenants/tenants.module.ts', 'import { Module } from "@nestjs/common";\nimport { TenantsController } from "./tenants.controller";\nimport { TenantsService } from "./tenants.service";\n\n@Module({\n  controllers: [TenantsController],\n  providers: [TenantsService]\n})\nexport class TenantsModule {}'],
    ['src/modules/tenants/tenants.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("tenants")\nexport class TenantsController {}'],
    ['src/modules/tenants/tenants.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class TenantsService {}'],

    // Users
    ['src/modules/users/users.module.ts', 'import { Module } from "@nestjs/common";\nimport { UsersController } from "./users.controller";\nimport { UsersService } from "./users.service";\n\n@Module({\n  controllers: [UsersController],\n  providers: [UsersService]\n})\nexport class UsersModule {}'],
    ['src/modules/users/users.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("users")\nexport class UsersController {}'],
    ['src/modules/users/users.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class UsersService {}'],

    // Teams
    ['src/modules/teams/teams.module.ts', 'import { Module } from "@nestjs/common";\nimport { TeamsController } from "./teams.controller";\nimport { TeamsService } from "./teams.service";\n\n@Module({\n  controllers: [TeamsController],\n  providers: [TeamsService]\n})\nexport class TeamsModule {}'],
    ['src/modules/teams/teams.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("teams")\nexport class TeamsController {}'],
    ['src/modules/teams/teams.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class TeamsService {}'],

    // Candidates
    ['src/modules/candidates/candidates.module.ts', 'import { Module } from "@nestjs/common";\nimport { CandidatesController } from "./candidates.controller";\nimport { CandidatesService } from "./candidates.service";\n\n@Module({\n  controllers: [CandidatesController],\n  providers: [CandidatesService]\n})\nexport class CandidatesModule {}'],
    ['src/modules/candidates/candidates.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("candidates")\nexport class CandidatesController {}'],
    ['src/modules/candidates/candidates.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class CandidatesService {}'],

    // Interviews
    ['src/modules/interviews/interviews.module.ts', 'import { Module } from "@nestjs/common";\nimport { InterviewsController } from "./interviews.controller";\nimport { InterviewsService } from "./interviews.service";\n\n@Module({\n  controllers: [InterviewsController],\n  providers: [InterviewsService]\n})\nexport class InterviewsModule {}'],
    ['src/modules/interviews/interviews.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("interviews")\nexport class InterviewsController {}'],
    ['src/modules/interviews/interviews.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class InterviewsService {}'],

    // Feedback
    ['src/modules/feedback/feedback.module.ts', 'import { Module } from "@nestjs/common";\nimport { FeedbackController } from "./feedback.controller";\nimport { FeedbackService } from "./feedback.service";\n\n@Module({\n  controllers: [FeedbackController],\n  providers: [FeedbackService]\n})\nexport class FeedbackModule {}'],
    ['src/modules/feedback/feedback.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("feedback")\nexport class FeedbackController {}'],
    ['src/modules/feedback/feedback.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class FeedbackService {}'],

    // Integrations - Zoho
    ['src/modules/integrations/zoho/zoho.module.ts', 'import { Module } from "@nestjs/common";\nimport { ZohoController } from "./zoho.controller";\nimport { ZohoService } from "./zoho.service";\n\n@Module({\n  controllers: [ZohoController],\n  providers: [ZohoService]\n})\nexport class ZohoModule {}'],
    ['src/modules/integrations/zoho/zoho.controller.ts', 'import { Controller } from "@nestjs/common";\n\n@Controller("integrations/zoho")\nexport class ZohoController {}'],
    ['src/modules/integrations/zoho/zoho.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class ZohoService {}'],

    // Audit
    ['src/modules/audit/audit.module.ts', 'import { Module } from "@nestjs/common";\nimport { AuditService } from "./audit.service";\n\n@Module({\n  providers: [AuditService]\n})\nexport class AuditModule {}'],
    ['src/modules/audit/audit.service.ts', 'import { Injectable } from "@nestjs/common";\n\n@Injectable()\nexport class AuditService {}'],

    // Jobs
    ['src/jobs/queues.ts', 'export const QUEUES = {\n  EMAIL: "email",\n  SYNC: "sync",\n  REMINDER: "reminder"\n};'],
    ['src/jobs/processors/email.processor.ts', 'import { Processor, WorkerHost } from "@nestjs/bullmq";\nimport { Job } from "bullmq";\n\n@Processor("email")\nexport class EmailProcessor extends WorkerHost {\n  async process(job: Job<any, any, string>): Promise<any> {\n    // Process email\n  }\n}'],
    ['src/jobs/processors/reminder.processor.ts', 'import { Processor, WorkerHost } from "@nestjs/bullmq";\nimport { Job } from "bullmq";\n\n@Processor("reminder")\nexport class ReminderProcessor extends WorkerHost {\n  async process(job: Job<any, any, string>): Promise<any> {\n    // Process reminder\n  }\n}'],
    ['src/jobs/processors/sync.processor.ts', 'import { Processor, WorkerHost } from "@nestjs/bullmq";\nimport { Job } from "bullmq";\n\n@Processor("sync")\nexport class SyncProcessor extends WorkerHost {\n  async process(job: Job<any, any, string>): Promise<any> {\n    // Process sync\n  }\n}'],

    // Config
    ['prisma/schema.prisma', 'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}'],
    ['.env', 'DATABASE_URL="postgresql://user:password@localhost:5432/lineup?schema=public"\nREDIS_HOST=localhost\nREDIS_PORT=6379\nJWT_SECRET=supersecretkey'],
    ['docker-compose.yml', 'version: "3.8"\nservices:\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: password\n      POSTGRES_DB: lineup\n    ports:\n      - "5432:5432"\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n  redis:\n    image: redis:7\n    ports:\n      - "6379:6379"\n\nvolumes:\n  postgres_data:'],
    ['Dockerfile', 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "run", "start:prod"]']

];

files.forEach(([subPath, content]) => {
    const fullPath = path.join(baseDir, subPath);
    fs.writeFileSync(fullPath, content);
    console.log(`Created ${fullPath}`);
});
