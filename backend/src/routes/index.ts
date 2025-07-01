import { celebrate, Joi, Segments } from 'celebrate'
import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'

import auth from '../middlewares/auth'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import productRouter from './product'
import uploadRouter from './upload'

const router = Router()

router.use('/auth', authRouter)
router.use('/product', productRouter)
router.use(
    '/order',
    auth,
    celebrate({
        [Segments.QUERY]: Joi.object().keys({
            limit: Joi.number().integer().min(1).max(10).default(10),
            skip: Joi.number().integer().min(0).default(0),
            sortField: Joi.string().valid('createdAt', 'totalAmount', 'orderNumber', 'status'),
            sortOrder: Joi.string().valid('asc', 'desc'),
        }),
    }),
    orderRouter
)
router.use('/upload', auth, uploadRouter)
router.use('/customers', auth, customerRouter)

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

export default router
