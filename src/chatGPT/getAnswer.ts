import { ConversationChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
    BufferWindowMemory,
    ChatMessageHistory
} from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'
import {
    HumanMessage,
    AIMessage,
    SystemMessage
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { FastifyReply } from "fastify";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { pull } from "langchain/hub";

export interface IMessage {
    role: 'human' | 'ai' | 'system',
    content: string
}

export interface IRequestBody {
    messages: IMessage[],
    gptModel: string,
    systemPrompt: string,
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

export const getAnswer = async (
    reqBody: IRequestBody,
    reply: FastifyReply
): Promise<void> => {

    const {messages, gptModel, systemPrompt} = reqBody

    const {
        chatMemory,
        currContent
    } = getChatMemory(messages)

    const chatModel = new ChatOpenAI({
        apiKey: process.env.API_KEY,
        model: gptModel,
        temperature: 0.8,
        streaming: true
        // callbacks: []
    })

    const chatPrompt
        = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate
                .fromTemplate(systemPrompt),
            new MessagesPlaceholder('chat_history'),
            HumanMessagePromptTemplate
                .fromTemplate("{input}"),
        ]);

    const BufferHistoryChain = new ConversationChain({
        llm: chatModel,
        prompt: chatPrompt,
        memory: chatMemory
    });

    await BufferHistoryChain.invoke({
        input: currContent,
        callbacks: [
            {
                handleLLMNewToken(token: string) {
                    reply.raw.write(token);
                    //console.log(token)
                },
                handleLLMEnd() {
                    // End the response stream
                    reply.raw.end();
                },
                handleError(error: Error) {
                    console.error(error);
                    reply.raw.write('data: Error occurred\n\n');
                    reply.raw.end();
                },
            },
        ]
    })
}