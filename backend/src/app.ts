import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import csrf from 'csurf'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'

import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())
const csrfProtection = csrf({ cookie: true })

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }))
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

app.options('*', cors())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
})

app.use(limiter)
app.use(routes)
app.use(errors())
app.use(errorHandler)

app.get('/csrf-token', csrfProtection, (req, res) => {
    res.send(req.csrfToken())
})

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
