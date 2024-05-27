import {
    IRequestBody,
    getAnswer
} from "@/chatGPT/getAnswer";
import { Redis } from "@upstash/redis";
import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";

const HEADERS: { key: string, value: string }[] = [
    { key: 'Content-Type', value: 'text/event-stream' },
    { key: 'Cache-Control', value: 'no-cache' },
    { key: 'Connection', value: 'keep-alive' },
    { key: 'Access-Control-Allow-Origin', value: '*' }, // Добавляем заголовок для CORS
];

const setHeaders = (reply: FastifyReply) => {
    HEADERS.forEach(header => {
        reply.raw.setHeader(header.key, header.value);
    });
};

export const sendMessage =
    async (fastify: FastifyInstance) => {
        fastify.route({
            method: 'POST',
            url: '/chat/send_message',
            handler: async (
                request: FastifyRequest<{
                    Body: IRequestBody
                }>,
                reply: FastifyReply
            ) => {
                try {
                    setHeaders(reply); // Добавляем заголовок для CORS
                    await getAnswer(request.body, reply)

                } catch (error) {
                    console.log(error)
                    reply.code(500).send({
                        error: error.message
                    });
                }
            }
        })
    }

