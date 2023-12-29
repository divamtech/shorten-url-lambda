const express = require('express')
const serverless = require('serverless-http')
const crypto = require('crypto')

const SELF_URL = process.env.SELF_URL || 'http://localhost:3000/'
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'test'
const TABLE = 'urls'
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DB || 'shorten_db',
  },
})

const app = express()
app.use(express.json())

app.get('/', async (_, res) => {
  res.send('<h1>URL shorten service, see the <a href="https://github.com/divamtech/shorten-url">docs</a></h1>')
})

app.get('/:code', async (req, res) => {
  const model = await knex(TABLE).where('code', req.params.code).first()
  if (!model) res.status(404).send('<h1>URL not found</h1>')
  res.redirect(302, model.url)
})

const router = express.Router()
router.use((req, res, next) => {
  const token = req.get('x-auth-token')
  if (!!token && token === AUTH_TOKEN) {
    next()
  } else {
    res.status(401).json({ message: 'Invalid auth token' })
  }
})

router.get('/urls', async (req, res) => {
  const [{ total }] = await knex(TABLE).count('id', { as: 'total' })
  const page = req.query.page && req.query.page > 0 ? req.query.page : 1
  const limit = req.query.limit && req.query.limit <= 30 ? req.query.limit : 10
  const models = await knex
    .select('*')
    .from(TABLE)
    .limit(limit)
    .offset((page - 1) * limit)
  res.json({ data: models.map((m) => ({ ...m, link: SELF_URL + m.code })), meta: { page, limit, total } })
})

router.post('/urls', async (req, res) => {
  const url = req.body.url.trim()
  const existingModel = await knex(TABLE).where('url', url).first()
  if (existingModel) return res.json({ ...existingModel, link: SELF_URL + existingModel.code })

  var code = req.body.code || crypto.createHash('md5').update(url).digest('hex').slice(0, 10)
  const [id] = await knex(TABLE).insert({ code, url })
  res.json({ id, code, url, link: SELF_URL + code })
})

router.delete('/urls/:code', async (req, res) => {
  const result = await knex(TABLE).where('code', req.params.code).del()
  if (result) {
    res.json({ message: 'URL deleted' })
  } else {
    res.status(404).json({ message: 'URL not found' })
  }
})

app.use('/api', router)

const startServer = async () => {
  app.listen(3000, () => {
    console.log('listening on port 3000!')
  })
}
startServer()

//lambda handling
const handler = serverless(app)

exports.handler = async (event, context, callback) => {
  const response = handler(event, context, callback)
  return response
}
