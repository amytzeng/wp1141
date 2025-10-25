"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Use dynamic require to avoid TypeScript compilation issues with Prisma
const prismaClientSingleton = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client');
    return new PrismaClient();
};
const prisma = globalThis.prisma ?? prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = prisma;
//# sourceMappingURL=client.js.map