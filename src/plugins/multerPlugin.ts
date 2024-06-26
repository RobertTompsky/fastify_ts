import multer from 'fastify-multer'
import { FileFilter } from 'fastify-multer/lib/interfaces';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, './uploads/');
    },
    filename: function (_req, file, cb) {  
        cb(null, 'file' + path.extname(file.originalname));
        //cb(null, file.filename);
    }
});

const fileFilter: FileFilter = (_req, file, cb) => {
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
