import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    RunnableWithMessageHistory,
    RunnablePassthrough,
    RunnableSequence,
    Runnable,
    RunnableConfig
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { getPineconeStore } from "./utils/getPineconeIndex";

export const createQAChain = async () => {
    const vectorStore = await getPineconeStore()
    const retriever = vectorStore.asRetriever();

    const llm = new ChatOpenAI({
        apiKey: process.env.API_KEY,
        model: "gpt-3.5-turbo",
        temperature: 0
    });

    const contextualizeQSystemPrompt = `Given a chat history and the latest user question
        which might reference context in the chat history, formulate a standalone question
        which can be understood without the chat history. Do NOT answer the question,
        just reformulate it if needed and otherwise return it as is.`;

    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(contextualizeQSystemPrompt),
        new MessagesPlaceholder("chat_history"),
        HumanMessagePromptTemplate.fromTemplate("{question}"),
    ]);

    const contextualizeQChain = contextualizeQPrompt
        .pipe(llm)
        .pipe(new StringOutputParser());

    const qaSystemPrompt = `You are an assistant for question-answering tasks.
        Use the following pieces of retrieved context to answer the question.
        If you don't know the answer, just say that you don't know.
        Use three sentences maximum and keep the answer concise.
        
        {context}`;

    const qaPrompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(qaSystemPrompt),
        new MessagesPlaceholder("chat_history"),
        HumanMessagePromptTemplate.fromTemplate("{question}"),
    ]);

    const contextualizedQuestion = (input: Record<string, unknown>) => {
        if ("chat_history" in input) {
            return contextualizeQChain;
        }

        return input.question as Runnable<any, string, RunnableConfig>;
    };

    const ragChain = RunnableSequence.from([
        RunnablePassthrough.assign({
            context: (input: Record<string, unknown>) => {
                const ragChain = contextualizedQuestion(input)

                return ragChain
                    .pipe(retriever)
                    .pipe(formatDocumentsAsString)
            },
        }),
        qaPrompt,
        llm,
    ]);

    const chainWithHistory = new RunnableWithMessageHistory({
        runnable: ragChain,
        getMessageHistory: (sessionId) =>
            new UpstashRedisChatMessageHistory({
                sessionId,
                sessionTTL: 3600,
                config: {
                    url: process.env.UPSTASH_REDIS_REST_URL!,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
                },
            }),
        inputMessagesKey: "question",
        historyMessagesKey: "chat_history",
    });

    return chainWithHistory

}