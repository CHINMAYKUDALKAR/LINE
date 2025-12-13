
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { EmailService } from '../src/modules/email/email.service';
import { PrismaService } from '../src/common/prisma.service';
import { ConfigModule } from '@nestjs/config';

// Mock EmailQueue to avoid Redis dependency if we just want to test sendMail directly
// However, EmailService instantiates EmailQueue in constructor. 
// We will rely on existing structure.

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    providers: [EmailService, PrismaService],
})
class AppTestModule { }

async function bootstrap() {
    const args = process.argv.slice(2);
    const toArg = args.find(a => a.startsWith('--to='));
    const to = toArg ? toArg.split('=')[1] : null;

    if (!to) {
        console.error('Please provide a recipient address using --to=email@example.com');
        process.exit(1);
    }

    const app = await NestFactory.createApplicationContext(AppTestModule);
    const emailService = app.get(EmailService);

    console.log(`Sending test email to ${to}...`);

    try {
        // using sendMail directly to skip queue/worker for immediate feedback
        const result = await emailService.sendMail(null, {
            to,
            template: 'invite', // using a simple existing template
            context: {
                name: 'Test Tenant',
                link: 'https://example.com/join'
            }
        });
        console.log('Email sent successfully!');
        console.log(result);
    } catch (error) {
        console.error('Failed to send email:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
