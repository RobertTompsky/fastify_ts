import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeIndex = () => {
    const pc = new Pinecone({
        apiKey: '410e1311-1f83-465c-8bff-f02864c97c32'
    });

    const pcIndex = pc.Index(
        'index228',
        'https://index228-lfw2xpm.svc.aped-4627-b74a.pinecone.io'
    )

    return pcIndex
}