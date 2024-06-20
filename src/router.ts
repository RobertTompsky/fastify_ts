import { FastifyInstance } from 'fastify';
import { basicRoute } from './routes/basic';
import { login } from './routes/users/nested/login';
import { sendMessage } from './routes/chat/sendMessage';
import { sendQuestion } from './routes/chat/sendQuestion';
import { uploadDocs } from './routes/chat/uploadDoc';

export const router = async (fastify: FastifyInstance) => {
    fastify.register(basicRoute, {prefix: '/'})
    fastify.register(login)
    fastify.register(sendMessage)
    fastify.register(sendQuestion)
    fastify.register(uploadDocs)
}