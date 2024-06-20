import { CustomFastifyRequest } from "@/lib/types/global"
import { upload } from "@/plugins/multerPlugin"
import { 
    FastifyInstance,
    FastifyReply 
} from "fastify"

export const uploadDocs =
    async (fastify: FastifyInstance) => {
        fastify.route({
            method: 'POST',
            url: '/chat/upload_docs',
            preHandler: upload.single('doc'),
            handler: async (
                request: CustomFastifyRequest,
                reply: FastifyReply
            ) => {
                console.log(request.file)
                try {
                    
                    
                    reply.code(200).send({
                        message: 'Success'
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