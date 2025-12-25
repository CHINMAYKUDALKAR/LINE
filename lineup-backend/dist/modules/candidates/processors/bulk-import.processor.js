"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopBulkImportProcessor = exports.startBulkImportProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const common_1 = require("@nestjs/common");
const spreadsheet_parser_util_1 = require("../utils/spreadsheet-parser.util");
const logger = new common_1.Logger('BulkImportProcessor');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let redisConnection = null;
let worker = null;
const startBulkImportProcessor = (prisma) => {
    if (!redisConnection) {
        redisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null,
        });
    }
    worker = new bullmq_1.Worker('candidates', async (job) => {
        if (job.name === 'bulk-import') {
            const { tenantId, userId, source, fileBuffer, mimeType } = job.data;
            logger.log(`Bulk import job: ${job.id} tenantId=${tenantId} source=${source}`);
            const result = {
                total: 0,
                imported: 0,
                skipped: 0,
                errors: [],
            };
            try {
                const buffer = Buffer.from(fileBuffer, 'base64');
                const rows = (0, spreadsheet_parser_util_1.parseSpreadsheet)(buffer, mimeType);
                result.total = rows.length;
                const emails = [];
                const phones = [];
                rows.forEach(row => {
                    if (row.email)
                        emails.push(row.email.toLowerCase());
                    if (row.phone)
                        phones.push(row.phone);
                });
                const existingByEmail = await prisma.candidate.findMany({
                    where: {
                        tenantId,
                        deletedAt: null,
                        email: { in: emails, mode: 'insensitive' },
                    },
                    select: { email: true },
                });
                const existingByPhone = await prisma.candidate.findMany({
                    where: {
                        tenantId,
                        deletedAt: null,
                        phone: { in: phones },
                    },
                    select: { phone: true },
                });
                const existingEmails = new Set(existingByEmail.map(c => c.email?.toLowerCase()));
                const existingPhones = new Set(existingByPhone.map(c => c.phone));
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const rowNum = i + 2;
                    if (!row.name || row.name.trim().length === 0) {
                        result.errors.push({
                            row: rowNum,
                            name: '(empty)',
                            reason: 'Name is required',
                        });
                        result.skipped++;
                        continue;
                    }
                    if (row.email && !EMAIL_REGEX.test(row.email)) {
                        result.errors.push({
                            row: rowNum,
                            name: row.name,
                            reason: `Invalid email format: ${row.email}`,
                        });
                        result.skipped++;
                        continue;
                    }
                    if (row.email && existingEmails.has(row.email.toLowerCase())) {
                        result.errors.push({
                            row: rowNum,
                            name: row.name,
                            reason: `Duplicate email: ${row.email}`,
                        });
                        result.skipped++;
                        continue;
                    }
                    if (row.phone && existingPhones.has(row.phone)) {
                        result.errors.push({
                            row: rowNum,
                            name: row.name,
                            reason: `Duplicate phone: ${row.phone}`,
                        });
                        result.skipped++;
                        continue;
                    }
                    try {
                        await prisma.candidate.create({
                            data: {
                                tenantId,
                                name: row.name.trim(),
                                email: row.email || null,
                                phone: row.phone || null,
                                roleTitle: row.roleTitle || null,
                                source: row.source || source || 'BULK_IMPORT',
                                stage: row.stage || 'applied',
                                tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
                            },
                        });
                        result.imported++;
                        if (row.email)
                            existingEmails.add(row.email.toLowerCase());
                        if (row.phone)
                            existingPhones.add(row.phone);
                    }
                    catch (createError) {
                        result.errors.push({
                            row: rowNum,
                            name: row.name,
                            reason: createError.message || 'Failed to create candidate',
                        });
                        result.skipped++;
                    }
                }
                logger.log(`Bulk import completed: ${result.imported} imported, ${result.skipped} skipped`);
            }
            catch (parseError) {
                logger.error(`Bulk import failed: ${parseError.message}`);
                result.errors.push({
                    row: 0,
                    name: 'FILE',
                    reason: parseError.message || 'Failed to parse file',
                });
            }
            await prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'BULK_IMPORT_COMPLETE',
                    metadata: {
                        jobId: job.id,
                        source,
                        result: JSON.parse(JSON.stringify(result)),
                    },
                },
            });
            return result;
        }
    }, { connection: redisConnection });
    worker.on('completed', job => logger.log(`Bulk import completed: ${job?.id}`));
    worker.on('failed', (job, err) => logger.error(`Bulk import failed: ${job?.id}`, err.stack));
};
exports.startBulkImportProcessor = startBulkImportProcessor;
const stopBulkImportProcessor = async () => {
    if (worker) {
        await worker.close();
        worker = null;
    }
    if (redisConnection) {
        await redisConnection.quit();
        redisConnection = null;
    }
};
exports.stopBulkImportProcessor = stopBulkImportProcessor;
//# sourceMappingURL=bulk-import.processor.js.map