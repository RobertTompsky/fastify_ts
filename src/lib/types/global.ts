import { FastifyRequest, FastifyServerOptions } from "fastify";
import { File } from 'fastify-multer/lib/interfaces';

export type AppOptions = Partial<FastifyServerOptions>;

export interface CustomFastifyRequest extends FastifyRequest {
    file?: File,
    body: {
        docName: string
    }
}