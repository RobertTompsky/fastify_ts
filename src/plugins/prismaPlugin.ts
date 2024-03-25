import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient
    }
}

async function initDatabaseConnection(): Promise<PrismaClient> {
    const db = new PrismaClient();
    await db.$connect();
    return db;
}

const prismaPlugin: FastifyPluginAsync = fp(async (server, options) => {
    const prisma = await initDatabaseConnection();

    // Make Prisma Client available through the fastify server instance: server.prisma
    server.decorate('prisma', prisma)

    server.addHook('onClose', async (server) => {
        await server.prisma.$disconnect()
    })
})

export default prismaPlugin