import { FastifyServerOptions } from "fastify";

export type AppOptions = Partial<FastifyServerOptions>;

export type ErrorResponse = {
    type: string,
    properties: {
        message: { type: string },
        error?: { type: string }
    }
}