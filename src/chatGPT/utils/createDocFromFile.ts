import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { File } from 'fastify-multer/lib/interfaces';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocumentLoader } from '@langchain/core/document_loaders/base'
import { Document } from '@langchain/core/documents'
import { TextLoader } from "langchain/document_loaders/fs/text";

export const createDocFromFile = async (docName: string, file: File) => {
    
    let loader: DocumentLoader;
    let docs: Document<Record<string, any>>[];

    switch (file.mimetype) {
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            loader = new DocxLoader(`./uploads/${docName}.docx`);
            docs = await loader.load();
            return docs;

        case 'application/pdf':
            loader = new PDFLoader(`./uploads/${docName}.pdf`);
            docs = await loader.load();
            return docs;

        case 'text/plain':
            loader = new TextLoader(`./uploads/${docName}.txt`);
            docs = await loader.load();
            return docs;

        default:
            throw new Error('Формат файла не поддерживается');
    }
}