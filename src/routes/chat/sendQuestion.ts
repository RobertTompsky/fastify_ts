import { createQAChain } from "@/chatGPT/createQAChain"
import { 
    FastifyInstance, 
    FastifyRequest, 
    FastifyReply 
} from "fastify"

export const sendQuestion =
    async (fastify: FastifyInstance) => {
        fastify.route({
            method: 'POST',
            url: '/chat/send_question',
            handler: async (
                request: FastifyRequest<{
                    Body: { question: string }
                }>,
                reply: FastifyReply
            ) => {
                try {
                    const { question } = request.body

                    const chain = await createQAChain(question)

                    const result = await chain.invoke(
                        { question },
                        {
                            configurable: {
                                sessionId: "1foobarbaz",
                            },
                        }
                    )

                    reply
                        .code(200)
                        .send(result.content)

                    console.log(result)

                } catch (error) {
                    console.log(error)
                    reply.code(500).send({
                        error: error.message
                    });
                }
            }
        })
    }
