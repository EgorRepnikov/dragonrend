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
  ({ autoIncludeRoutes = true, routesDir = 'routes' }, instance) => {
    const dir = `${process.cwd()}/${routesDir}`
    autoIncludeRoutes && fs.existsSync(dir) && fs
      .readdirSync(dir)
      .forEach(file => {
        const router = require(`${dir}/${file}`)
        if (router instanceof Router) {
          instance.merge(router)
        }
      })
    },
  // Auto including of Middlware-Functions to application
  ({ autoIncludeMiddleware = true, middlewareDir = 'middleware' }, instance) => {
    const dir = `${process.cwd()}/${middlewareDir}`
    autoIncludeMiddleware && fs.existsSync(dir) && fs
      .readdirSync(dir)
      .forEach(file => {
        const middleware = require(`${dir}/${file}`)
        if (typeof middleware === 'function') {
          instance.middleware(middleware)
        }
      })
    }
]

exports.initTasks = (options, currentDir) =>
  (instance) => tasks.forEach(task => task(options, instance, currentDir))
