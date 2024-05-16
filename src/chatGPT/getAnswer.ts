import { ConversationChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { BufferWindowMemory, ChatMessageHistory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'
import {
    HumanMessage,
    AIMessage,
    SystemMessage
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { FastifyReply } from "fastify";

export interface IMessage {
    role: 'human' | 'ai' | 'system',
    content: string
}

export interface IResponseBody {
    response: string
}

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

export const chatModel = new ChatOpenAI({
    apiKey: process.env.API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    streaming: true,
    // callbacks: []
})

export const getAnswer = async (
    messages: IMessage[]
) => {

    const {
        chatMemory,
        currContent
    } = getChatMemory(messages)

    const chatPrompt
        = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate
                .fromTemplate("You are a friendly assistant."),
            new MessagesPlaceholder('chat_history'),
            HumanMessagePromptTemplate
                .fromTemplate("{input}"),
        ]);

    const BufferHistoryChain = new ConversationChain({
        llm: chatModel,
        prompt: chatPrompt,
        memory: chatMemory
    });

    const result = await BufferHistoryChain.invoke({
        input: currContent,
        callbacks: [
            {
              handleLLMNewToken(token: string) {
                console.log({ token });
              },
            },
          ]
    })

    const responseBody: IResponseBody = {
        response: result.response as string,
    }

    return responseBody
}