import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { doubleCsrf } from 'csrf-csrf'
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
const {
    doubleCsrfProtection,
    generateCsrfToken,
  } = doubleCsrf({
    getSecret: () => 'your-very-secret-key',
    getSessionIdentifier: (req) => req.ip || '',  
  });

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }))
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

app.options('*', cors())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    handler: (req, res) => {
        res.set('Retry-After', String(15 * 60));
        res.status(429).json({
            error: 'Too many requests',
            message: 'Слишком много запросов, попробуйте позже.'
        });
    }
})

app.use(limiter)
app.use(routes)
app.use(errors())
app.use(errorHandler)

app.get('/csrf-token', (req, res) => {
    const csrfToken = generateCsrfToken(req, res)
    res.send({ csrfToken })
})

app.use(doubleCsrfProtection);

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
