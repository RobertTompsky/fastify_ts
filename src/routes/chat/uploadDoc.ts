import { createChunks } from "@/chatGPT/utils/createChunks"
import { CustomFastifyRequest } from "@/lib/types/global"
import { upload } from "@/plugins/multerPlugin"
import {
    FastifyInstance,
    FastifyReply
} from "fastify"
import fs from 'fs-extra'
import { getPineconeStore } from "@/chatGPT/utils/getPineconeIndex"
import { createDocFromFile } from "@/chatGPT/utils/createDocFromFile"

export const uploadDocs =
    async (fastify: FastifyInstance) => {
        fastify.route({
            method: 'POST',
            url: '/upload_docs',
            preHandler: upload.single('doc'),
            handler: async (
                request: CustomFastifyRequest,
                reply: FastifyReply
            ) => {
                //console.log(request.file)
                const { path } = request.file
                const { docName } = request.body

                try {
                    fs.rename(path, path.replace('file', docName))

                    const docs = await createDocFromFile(docName, request.file)

                    const chunks = await createChunks(docs)

                    const vectorStore = await getPineconeStore()

                    await vectorStore.addDocuments(chunks)
                    //console.log(docName)
                    reply.code(200).send({
                        message: `${docName} is uploaded`
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