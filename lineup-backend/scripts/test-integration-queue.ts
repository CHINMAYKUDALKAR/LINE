
// Usage: npx ts-node scripts/test-integration-queue.ts

import 'dotenv/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

async function main() {
    console.log('Connecting to Redis...');
    const conn = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: null
    });

    const queue = new Queue('integrations', { connection: conn });

    console.log('Adding test job...');
    const job = await queue.add('test-job', {
        tenantId: 'test-tenant',
        provider: 'salesforce',
        action: 'pull',
        payload: { since: '2023-01-01' }
    });

    console.log(`Job added with ID: ${job.id}`);
    console.log('Check backend logs to see if it was processed.');

    await queue.close();
    await conn.quit();
}

main().catch(console.error);
