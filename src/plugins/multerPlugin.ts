import { FastifyRequest } from 'fastify';
import multer from 'fastify-multer'
import { File, FileFilter, FileFilterCallback } from 'fastify-multer/lib/interfaces';

const storage = multer.diskStorage({
    destination: function (_req: FastifyRequest, _file: File, cb) {
        cb(null, './uploads/');
    },
    filename: function (_req: FastifyRequest, _file: File, cb) {
        cb(null, _file.originalname);
    }
});

const fileFilter: FileFilter = (_req: FastifyRequest, file: File, cb: FileFilterCallback) => {
    // Reject files with a mimetype other than 'image/png' or 'image/jpeg'
    if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'text/plain'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only WORD/PDF/TXT files are allowed'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    }
})

export const multerParser = multer.contentParser
