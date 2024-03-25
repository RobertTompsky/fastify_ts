import Fastify from 'fastify'
import { AppOptions } from '@/lib/types/global';
import prismaPlugin from '@/plugins/prismaPlugin';
import { router } from './router';

async function buildApp(options: AppOptions) {
    const fastify = Fastify(options);
    
    fastify.register(prismaPlugin)
    fastify.register(router)

    return fastify;
}

export { buildApp }