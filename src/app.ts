import Fastify from 'fastify'
import cors from '@fastify/cors'
import { AppOptions } from '@/lib/types/global';
import prismaPlugin from '@/plugins/prismaPlugin';
import { router } from './router';
import { multerParser } from './plugins/multerPlugin';

async function buildApp(options: AppOptions) {
    const fastify = Fastify(options);
    
    fastify.register(prismaPlugin)
    fastify.register(multerParser)
    fastify.register(router)
    fastify.register(cors)

    return fastify;
}

export { buildApp }