import { 
    IRequestBody, 
    getChatMemory, 
    createConversationChain 
} from "@/chatGPT/createConversationChain";
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
                    const { messages } = request.body
                    const { currContent } = getChatMemory(messages)
                    setHeaders(reply);

                    const chain = await createConversationChain(request.body)

                    await chain.invoke({
                        input: currContent,
                        callbacks: [
                            {
                                handleLLMNewToken(token: string) {
                                    reply.raw.write(token);
                                    //console.log(token)
                                },
                                handleLLMEnd() {
                                    // End the response stream
                                    reply.raw.end();
                                },
                                handleError(error: Error) {
                                    console.error(error);
                                    reply.code(500).send('Ошибка')
                                },
                            },
                        ]
                    })

                } catch (error) {
                    console.log(error)
                    reply.code(500).send({
                        error: error.message
                    });
                }
            }
        })
    }

