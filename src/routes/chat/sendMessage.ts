import {
    IMessage,
    getAnswer
} from "@/chatGPT/getAnswer";
import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest
} from "fastify";
import fs from 'fs-extra'

interface ChatRequestBody {
    messages: IMessage[];
}

export const sendMessage =
    async (fastify: FastifyInstance) => {
        fastify.route({
            method: 'POST',
            url: '/chat/send_message',
            handler: async (
                request: FastifyRequest<{
                    Body: ChatRequestBody
                }>,
                reply: FastifyReply
            ) => {
                const { messages } = request.body

                try {
                    reply.raw.setHeader('Content-Type', 'text/event-stream');
                    reply.raw.setHeader('Cache-Control', 'no-cache');
                    reply.raw.setHeader('Connection', 'keep-alive');
                    reply.raw.setHeader('Access-Control-Allow-Origin', '*'); // Добавляем заголовок для CORS
                    await getAnswer(messages, reply) 

                } catch (error) {
                    console.log(error)
                    reply.code(500).send({
                        error: error.message
                    });
                }
            }
        })
    }

