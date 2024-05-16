import { FastifyInstance } from "fastify";

export const basicRoute = async (fastify: FastifyInstance): Promise<void> => {
    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            response: {
                200: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
              }
        },
        handler: function (request, reply) {
            try {
                reply.send({
                    message: 'Сервер работает'
                })
            } catch (error) {
                reply.send({
                    error: 'Ошибка запроса'
                })
            }
        }
    })
}