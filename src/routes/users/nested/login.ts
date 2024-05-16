import { loginHandler } from "@/handlers/users/loginHandler";
import { UserRequestSchema, UserReplySchema } from "@/lib/schemas/user";
import { FastifyInstance } from "fastify";

export const login =
    async (fastify: FastifyInstance) => {
        fastify.route({
            method: 'POST',
            url: '/users/login',
            schema: {
                body: UserRequestSchema,
                response: {
                    200: UserReplySchema
                }
            },
            handler: loginHandler
        })
    }

