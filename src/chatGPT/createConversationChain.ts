import { ConversationChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
    BufferMemory,
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
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { AgentExecutor, createOpenAIToolsAgent, createToolCallingAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { UpstashRedisCache } from "@langchain/community/caches/upstash_redis";
import { Calculator } from "@langchain/community/tools/calculator";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

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

const cache = new UpstashRedisCache({
    config: {
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
    },
});

export const extractLastQuestion = (messages: IMessage[]) => {
    const currContent = messages.length > 0 ?
        messages[messages.length - 1].content : ''

    const previousMessages = messages
        .slice(0, messages.length - 1)

    return { currContent, previousMessages }
}

export const getChatMemory = (messages: IMessage[]) => {
    const {
        currContent,
        previousMessages
    } = extractLastQuestion(messages)

    const chatMemory = new BufferMemory({
        chatHistory: new ChatMessageHistory(
            createChatMessagesFromStored(
                previousMessages
            )
        ),
        memoryKey: 'chat_history',
        returnMessages: true
    })

    console.log(chatMemory.chatHistory)

    return { chatMemory, currContent }
}

export const createConversationChain = async (
    reqBody: IRequestBody
) => {
    const {
        messages,
        gptModel,
        systemPrompt
    } = reqBody

    const { chatMemory } = getChatMemory(messages)

    const chatModel = new ChatOpenAI({
        apiKey: process.env.API_KEY,
        model: gptModel,
        temperature: 1.2,
        streaming: true,
        cache
        // callbacks: []
    })

    const chatPrompt
        = ChatPromptTemplate.fromMessages([
            ['system', `${systemPrompt}You may not need to use tools for every query - the user may just want to chat!`],
            ["placeholder", "{chat_history}"],
            ['human', "{input}"],
            ["placeholder", "{agent_scratchpad}"],
        ]);

    console.log(chatPrompt)

    const search = new TavilySearchResults({
        apiKey: process.env.TAVILY_API_KEY,
        maxResults: 3
    })

    const wiki = new WikipediaQueryRun({
        topKResults: 3,
        maxDocContentLength: 4000,
    })

    const tools = [search, wiki, new Calculator()]

    const agent = createToolCallingAgent({
        llm: chatModel,
        tools,
        prompt: chatPrompt
    })

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
        memory: chatMemory,
        //returnIntermediateSteps: false
    });

    return agentExecutor

    /*
    const BufferHistoryChain = new ConversationChain({
        llm: chatModel,
        prompt: chatPrompt,
        memory: chatMemory
    });

    return BufferHistoryChain
    */
}