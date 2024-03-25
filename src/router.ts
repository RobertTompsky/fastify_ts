import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const router = async(fastify: FastifyInstance) => {
    fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        return { message: 'Сервер работает' };
    });
}