import { UserBody } from "@/lib/types/user";
import { 
    FastifyReply, 
    FastifyRequest, 
    RouteHandlerMethod 
} from "fastify";

export const loginHandler: RouteHandlerMethod =
    async (
        request: FastifyRequest<{ Body: UserBody }>,
        reply: FastifyReply
    ) => {
        const { name, email, password } = request.body;
        const { prisma } = request.server
        try {
            const users = await prisma.user.findMany()
            reply
                .status(200)
                .send({ name, email });
        } catch (error) {

        }
    };