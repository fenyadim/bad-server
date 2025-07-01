import { Request } from 'express'
import fs from 'fs'
import multer, { FileFilterCallback } from 'multer'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const getSafeUploadPath = () => {
    const uploadPath = process.env.UPLOAD_PATH_TEMP || ''
    if (uploadPath.includes('..') || uploadPath.startsWith('/')) {
        throw new Error('Недопустимый путь для загрузки файлов')
    }
    const fullPath = join(__dirname, `../public/${uploadPath}`)
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }
    return uploadPath
}

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        cb(
            null,
            join(
                __dirname,
                getSafeUploadPath()
                    ? `../public/${getSafeUploadPath()}`
                    : '../public'
            )
        )
    },

    filename: (_req: Request, _: Express.Multer.File, cb: FileNameCallback) => {
        cb(null, uuidv4())
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }

    return cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
})
