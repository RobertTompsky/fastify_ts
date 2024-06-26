import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {Document} from '@langchain/core/documents'

export const createChunks = async (
    docs: Document<Record<string, any>>[]
) => {

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
    });

    const chunks = await splitter.splitDocuments(docs)

    return chunks
}
