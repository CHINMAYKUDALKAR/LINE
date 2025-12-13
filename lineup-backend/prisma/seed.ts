import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedCommunicationTemplates } from './seeds/seed-templates';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data (optional - comment out if you want to keep data)
    console.log('🗑️  Clearing existing data...');
    await prisma.messageLog.deleteMany({});
    await prisma.scheduledMessage.deleteMany({});
    await prisma.automationRule.deleteMany({});
    await prisma.messageTemplate.deleteMany({});
    await prisma.interview.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});

    // Create tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'tenant_123' },
        update: { name: 'Mintskill' },
        create: {
            id: 'tenant_123',
            name: 'Mintskill',
            domain: 'mintskill.com',
            settings: {},
        },
    });
    console.log('✅ Created tenant:', tenant.name);

    // Create admin user (you)
    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@mintskill.com',
            password: hashedPassword,
            name: 'Chinmay Kudalkar',
            role: 'ADMIN',
            tenantId: tenant.id,
        },
    });
    console.log('✅ Created admin:', adminUser.email);

    // Create UserTenant record for admin (required for new auth system)
    await prisma.userTenant.upsert({
        where: { userId_tenantId: { userId: adminUser.id, tenantId: tenant.id } },
        update: { role: 'ADMIN', status: 'ACTIVE' },
        create: {
            userId: adminUser.id,
            tenantId: tenant.id,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });

    // Create interviewer users
    const interviewers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'sarah.chen@mintskill.com',
                password: hashedPassword,
                name: 'Sarah Chen',
                role: 'INTERVIEWER',
                tenantId: tenant.id,
            },
        }),
        prisma.user.create({
            data: {
                email: 'mike.johnson@mintskill.com',
                password: hashedPassword,
                name: 'Mike Johnson',
                role: 'INTERVIEWER',
                tenantId: tenant.id,
            },
        }),
        prisma.user.create({
            data: {
                email: 'priya.sharma@mintskill.com',
                password: hashedPassword,
                name: 'Priya Sharma',
                role: 'RECRUITER',
                tenantId: tenant.id,
            },
        }),
    ]);
    console.log('✅ Created', interviewers.length, 'team members');

    // Create UserTenant records for all interviewers
    for (const user of interviewers) {
        const role = user.email.includes('priya') ? 'RECRUITER' : 'INTERVIEWER';
        await prisma.userTenant.upsert({
            where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
            update: { role, status: 'ACTIVE' },
            create: {
                userId: user.id,
                tenantId: tenant.id,
                role,
                status: 'ACTIVE',
            },
        });
    }
    console.log('✅ Created UserTenant records for all users');

    // Create realistic candidates
    const candidates = await Promise.all([
        prisma.candidate.create({
            data: {
                name: 'Alex Rivera',
                email: 'alex.rivera@gmail.com',
                phone: '+1-555-0101',
                tenantId: tenant.id,
                stage: 'screening',
                source: 'LinkedIn',
            },
        }),
        prisma.candidate.create({
            data: {
                name: 'Emma Watson',
                email: 'emma.watson@outlook.com',
                phone: '+1-555-0102',
                tenantId: tenant.id,
                stage: 'interview',
                source: 'Referral',
            },
        }),
        prisma.candidate.create({
            data: {
                name: 'James Park',
                email: 'james.park@yahoo.com',
                phone: '+1-555-0103',
                tenantId: tenant.id,
                stage: 'technical',
                source: 'Job Board',
            },
        }),
        prisma.candidate.create({
            data: {
                name: 'Sofia Martinez',
                email: 'sofia.martinez@gmail.com',
                phone: '+1-555-0104',
                tenantId: tenant.id,
                stage: 'offer',
                source: 'Website',
            },
        }),
        prisma.candidate.create({
            data: {
                name: 'David Kim',
                email: 'david.kim@proton.me',
                phone: '+1-555-0105',
                tenantId: tenant.id,
                stage: 'screening',
                source: 'Indeed',
            },
        }),
    ]);
    console.log('✅ Created', candidates.length, 'candidates');

    // Create sample interviews
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    await prisma.interview.create({
        data: {
            tenantId: tenant.id,
            candidateId: candidates[0].id,
            interviewerIds: [interviewers[0].id],
            date: tomorrow,
            durationMins: 45,
            stage: 'Technical Screen',
            status: 'SCHEDULED',
            meetingLink: 'https://meet.google.com/abc-defg-hij',
        },
    });

    await prisma.interview.create({
        data: {
            tenantId: tenant.id,
            candidateId: candidates[1].id,
            interviewerIds: [interviewers[1].id, interviewers[0].id],
            date: nextWeek,
            durationMins: 60,
            stage: 'Final Round',
            status: 'SCHEDULED',
            meetingLink: 'https://zoom.us/j/1234567890',
        },
    });
    console.log('✅ Created 2 sample interviews');

    // Seed communication templates
    await seedCommunicationTemplates(tenant.id);
    console.log('✅ Seeded communication templates');

    console.log('\n🎉 Seeding complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@mintskill.com');
    console.log('   Password: password123');
    console.log('\n👥 Candidates to message:');
    candidates.forEach(c => console.log(`   - ${c.name} (${c.email})`));
    console.log('\n💡 All emails will appear in MailHog at http://localhost:8025');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
