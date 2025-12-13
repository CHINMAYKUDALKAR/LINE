#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const name = process.argv[2];
    const domain = process.argv[3] || null;
    if (!name) {
        console.error('Usage: provision-tenant <name> [domain]');
        process.exit(1);
    }
    const tenant = await prisma.tenant.create({ data: { name, domain } });
    console.log('Created tenant', tenant.id);
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=provision-tenant.js.map