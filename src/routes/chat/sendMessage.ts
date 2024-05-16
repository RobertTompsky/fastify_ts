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
                    const res = await getAnswer(messages)
                    reply.code(200).send(res)
                } catch (error) {
                    console.log(error)
                    reply.code(500).send({
                        error: error
                    });
                }
            }
        })
    }

