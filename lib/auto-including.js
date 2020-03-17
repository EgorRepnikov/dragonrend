const fs = require('fs')

const { Router } = require('./routing')

const tasks = [
  // Auto including of Routers to application
  ({ autoIncludeRoutes = true, routesDir = 'routes', ...other }, instance) =>
    checkDirAndRun(autoIncludeRoutes, other, routesDir, dir =>
      fs.readdirSync(dir).forEach(file => {
        const router = require(`${dir}/${file}`)
        if (router instanceof Router) {
          instance.merge(router)
        }
      })),
  // Auto including of Middlware-Functions to application
  ({ autoIncludeMiddleware = true, middlewareDir = 'middleware', ...other }, instance) =>
    checkDirAndRun(autoIncludeMiddleware, other, middlewareDir, dir =>
      fs.readdirSync(dir).forEach(file => {
        const middleware = require(`${dir}/${file}`)
        if (typeof middleware === 'function') {
          instance.middleware(middleware)
        }
      })),
  // Auto including of Content Type Parsers to application
  ({ autoIncludeContentTypeParsers = true, contentTypeParsersDir = 'parsers', ...other }, instance) =>
    checkDirAndRun(autoIncludeContentTypeParsers, other, contentTypeParsersDir, dir =>
      fs.readdirSync(dir).forEach(file => {
        const parser = require(`${dir}/${file}`)
        if (typeof parser === 'object' &&
            typeof parser.contentType === 'string' &&
            typeof parser.parse === 'function') {
          instance.addContentTypeParser(parser.contentType, parser.parse)
        }
      }))
]

function checkDirAndRun(include, { rootDir = process.cwd() }, path, cb) {
  if (include) {
    const dir = `${rootDir}/${path}`
    if (fs.existsSync(dir)) {
      cb(dir)
    }
  }
}

exports.initTasks = options => instance => {
  if (options) {
    if (typeof options === 'boolean') {
      options = {}
    }
    tasks.forEach(task => task(options, instance))
  }
}
