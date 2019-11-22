const fs = require('fs')

const { Router } = require('./routing')
const { isSentS, sendS } = require('./symbols')

exports.reduce = (array, ctx) => {
  return array.reduce((previous, current) => {
    return previous.then(() => {
      return !ctx.response[isSentS] && this.wrapMiddleware(current)(ctx)
    })
  }, Promise.resolve())
}

exports.wrapMiddleware = (middleware) => {
  return ctx => Promise.resolve(middleware(ctx)).then(res => {
    if (res) {
      const { status = 200, headers = {}, body = '' } = res
      ctx.response.status(status)
      for (const header in headers) {
        ctx.response.header(header, headers[header])
      }
      ctx.response[sendS](body)
    }
  })
}

const tasks = [
  // Auto including of Routers to application
  ({ autoIncludeRoutes = true, routesDir = 'routes', ...other }, instance) =>
    autoIncludeRoutes && checkDirAndRun(other, routesDir, (dir) =>
      fs.readdirSync(dir).forEach(file => {
        const router = require(`${dir}/${file}`)
        if (router instanceof Router) {
          instance.merge(router)
        }
      })),
  // Auto including of Middlware-Functions to application
  ({ autoIncludeMiddleware = true, middlewareDir = 'middleware', ...other }, instance) =>
    autoIncludeMiddleware && checkDirAndRun(other, middlewareDir, (dir) =>
      fs.readdirSync(dir).forEach(file => {
        const middleware = require(`${dir}/${file}`)
        if (typeof middleware === 'function') {
          instance.middleware(middleware)
        }
      })),
  // Auto including of Content Type Parsers to application
  ({ autoIncludeContentTypeParsers = true, contentTypeParsersDir = 'parsers', ...other }, instance) =>
    autoIncludeContentTypeParsers && checkDirAndRun(other, contentTypeParsersDir, (dir) =>
      fs.readdirSync(dir).forEach(file => {
        const parser = require(`${dir}/${file}`)
        if (typeof parser === 'object' &&
            typeof parser.contentType === 'string' &&
            typeof parser.parse === 'function') {
          instance.addContentTypeParser(parser.contentType, parser.parse)
        }
      }))
]

function checkDirAndRun({ rootDir = process.cwd() }, path, cb) {
  const dir = `${rootDir}/${path}`
  if (fs.existsSync(dir)) {
    cb(dir)
  }
}

exports.initTasks = (options) => (instance) =>
  options && tasks.forEach(task => task(options, instance))

exports.responses = {
  json({ status, body, headers = {} }) {
    headers['content-type'] = 'application/json'
    return { status, body: JSON.stringify(body) , headers }
  },
  text({ status, body, headers = {} }) {
    headers['content-type'] = 'text/plain'
    return { status, body, headers }
  },
  html({ status, body, headers = {} }) {
    headers['content-type'] = 'text/html'
    return { status, body, headers }
  }
}
