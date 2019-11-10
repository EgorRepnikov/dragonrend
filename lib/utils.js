const fs = require('fs')

const Router = require('./Router')
const { isSentS } = require('./symbols')

exports.reduce = (array, ctx) => {
  return array.reduce((previous, current) => {
    return previous.then(() => !ctx.response[isSentS] && current(ctx))
  }, Promise.resolve())
}

const tasks = [
  // Auto including of Routers to application
  ({ autoIncludeRoutes = true, routesDir = 'routes' }, instance) =>
    autoIncludeRoutes && checkDirAndRun(routesDir, (dir) =>
      fs.readdirSync(dir).forEach(file => {
        const router = require(`${dir}/${file}`)
        if (router instanceof Router) {
          instance.merge(router)
        }
      })),
  // Auto including of Middlware-Functions to application
  ({ autoIncludeMiddleware = true, middlewareDir = 'middleware' }, instance) =>
    autoIncludeMiddleware && checkDirAndRun(middlewareDir, (dir) =>
      fs.readdirSync(dir).forEach(file => {
        const middleware = require(`${dir}/${file}`)
        if (typeof middleware === 'function') {
          instance.middleware(middleware)
        }
      })),
  // Auto including of Content Type Parsers to application
  ({ autoIncludeContentTypeParsers = true, contentTypeParsersDir = 'parsers' }, instance) =>
    autoIncludeContentTypeParsers && checkDirAndRun(contentTypeParsersDir, (dir) =>
      fs.readdirSync(dir).forEach(file => {
        const parser = require(`${dir}/${file}`)
        if (typeof parser === 'object' &&
            typeof parser.contentType === 'string' &&
            typeof parser.parse === 'function') {
          instance.addContentTypeParser(parser.contentType, parser.parse)
        }
      }))
]

function checkDirAndRun(pathRightHalf, cb) {
  const dir = `${process.cwd()}/${pathRightHalf}`
  if (fs.existsSync(dir)) {
    cb(dir)
  }
}

exports.initTasks = (options) =>
  (instance) => tasks.forEach(task => task(options, instance))
