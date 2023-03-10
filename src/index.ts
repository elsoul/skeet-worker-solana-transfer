import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import * as Endpoint from '@/routes'

dotenv.config()
const skeetEnv = process.env.NODE_ENV || 'development'
const port = process.env.PORT || 1112

export const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const router = express.Router()

router.get('/', Endpoint.root)
router.post('/run', Endpoint.run)
app.use('/', router)

export const expressServer = app.listen(port, async () => {
  console.log(
    `[env:${skeetEnv}]: Server is running at http://localhost:${port}`
  )
})
