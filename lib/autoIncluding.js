const fs = require('fs')

const { Router } = require('./routing')

const tasks = [
  // Auto including of Routers to application
  ({ autoIncludeRoutes = true, routesDir = 'routes', ...other }, instance) =>
    autoIncludeRoutes && checkDirAndRun(other, routesDir, dir =>
      fs.readdirSync(dir).forEach(file => {
        const router = require(`${dir}/${file}`)
        if (router instanceof Router) {
          instance.merge(router)
        }
      })),
  // Auto including of Middlware-Functions to application
  ({ autoIncludeMiddleware = true, middlewareDir = 'middleware', ...other }, instance) =>
    autoIncludeMiddleware && checkDirAndRun(other, middlewareDir, dir =>
      fs.readdirSync(dir).forEach(file => {
        const middleware = require(`${dir}/${file}`)
        if (typeof middleware === 'function') {
          instance.middleware(middleware)
        }
      })),
  // Auto including of Content Type Parsers to application
  ({ autoIncludeContentTypeParsers = true, contentTypeParsersDir = 'parsers', ...other }, instance) =>
    autoIncludeContentTypeParsers && checkDirAndRun(other, contentTypeParsersDir, dir =>
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

exports.initTasks = options => instance =>
  options && tasks.forEach(task => task(options, instance))
