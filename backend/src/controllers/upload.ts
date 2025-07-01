import { NextFunction, Request, Response } from 'express'
import fs from 'fs/promises'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        // Post-upload check: file size >= 2 KB
        const filePath = req.file.path
        const stat = await fs.stat(filePath)
        if (stat.size < 2 * 1024) {
            await fs.unlink(filePath)
            return next(new BadRequestError('Размер файла должен быть не менее 2 КБ'))
        }
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
