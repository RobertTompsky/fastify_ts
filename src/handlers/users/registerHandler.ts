import { UserBody } from "@/lib/types/user";
import {
    FastifyReply,
    FastifyRequest,
    RouteHandlerMethod
} from "fastify";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "@prisma/client";

export const registerHandler: RouteHandlerMethod =
    async (
        request: FastifyRequest<{ Body: UserBody }>,
        reply: FastifyReply
    ) => {
        const { name, email, password } = request.body;
        const { prisma } = request.server
        try {
            const existingUser: User = await prisma.user.findFirst({
                where: {
                    OR: [
                        { name },
                        { email }
                    ]
                }
            })

            if (!existingUser) {
                const salt: string = await bcrypt.genSalt(10)
                const hashedPassord = await bcrypt.hash(password, salt)

                const user: User = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassord
                    }
                })

                reply.status(200).send({
                    name: user.name,
                    email: user.email
                })
            } else {
                return reply.status(409).send({
                    message: 'Пользователь уже существует'
                });
            }


        } catch (error) {
            reply.status(500).send({
                error: 'Ошибка'
            })
        }
    };