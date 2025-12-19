"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const cookieParser = require('cookie-parser');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    const isDev = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: isDev ? true : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/,
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Lineup API')
        .setDescription('Bulk Interview Management System - Comprehensive API Documentation')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('auth', 'Authentication and authorization endpoints')
        .addTag('candidates', 'Candidate management')
        .addTag('interviews', 'Interview scheduling and management')
        .addTag('storage', 'File storage and management')
        .addTag('feedback', 'Interview feedback')
        .addTag('reports', 'Analytics and reporting')
        .addTag('integrations', 'Third-party integrations (Zoho, Google, Outlook)')
        .addTag('email', 'Email services')
        .addServer('http://localhost:4000', 'Local development')
        .addServer('https://api.lineup.com', 'Production')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'Lineup API Documentation',
        customfavIcon: 'https://lineup.com/favicon.ico',
        customCss: '.swagger-ui .topbar { display: none }',
    });
    const port = process.env.PORT || 4000;
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    console.log(`Application is running on: http://${host}:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map