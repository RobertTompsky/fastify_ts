import { Static, Type } from '@sinclair/typebox'

export const UserRequestSchema = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 })
})

export const UserReplySchema = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' })
})

