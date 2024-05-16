import { ErrorResponse } from "../types/global";

export const errorResponseSchema: ErrorResponse = {
    type: 'object',
    properties: {
        message: { type: 'string'}
    }
}