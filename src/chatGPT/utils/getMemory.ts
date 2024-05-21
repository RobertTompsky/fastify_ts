import { 
    BufferWindowMemory, 
    ChatMessageHistory 
} from "langchain/memory";
import 'dotenv/config'
import {
    HumanMessage,
    AIMessage,
    SystemMessage
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { IMessage } from "../getAnswer";

export function createChatMessagesFromStored(
    messages: IMessage[]
): BaseMessage[] {
    return messages.map((message) => {
        switch (message.role) {
            case "human":
                return new HumanMessage(message.content);
            case "ai":
                return new AIMessage(message.content);
            case "system":
                return new SystemMessage(message.content);
            default:
                throw new Error("Role must be defined for generic messages");
        }
    });
}

export const extractLastQuestion = (messages: IMessage[]) => {
    const currContent = messages.length > 0 ?
        messages[messages.length - 1].content : ''

    const previousMessages = messages
        .slice(0, messages.length - 1)

    console.log(currContent)

    return { currContent, previousMessages }
}

export const getChatMemory = (messages: IMessage[]) => {
    const {
        currContent,
        previousMessages
    } = extractLastQuestion(messages)

    const chatMemory = new BufferWindowMemory({
        chatHistory: new ChatMessageHistory(
            createChatMessagesFromStored(
                previousMessages
            )
        ),
        memoryKey: 'chat_history',
        k: 5,
        returnMessages: true
    })

    return { chatMemory, currContent }
}