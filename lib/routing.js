const Router = require('./Router')
const { addS } = require('./symbols')

const ROUTE = exports.ROUTE = (method, path, handlers) => [method, path, handlers]

exports.GET = (path, ...handlers) => ROUTE('GET', path, handlers)
exports.POST = (path, ...handlers) => ROUTE('POST', path, handlers)
exports.PUT = (path, ...handlers) => ROUTE('PUT', path, handlers)
exports.PATCH = (path, ...handlers) => ROUTE('PATCH', path, handlers)
exports.HEAD = (path, ...handlers) => ROUTE('HEAD', path, handlers)
exports.OPTIONS = (path, ...handlers) => ROUTE('OPTIONS', path, handlers)
exports.DELETE = (path, ...handlers) => ROUTE('DELETE', path, handlers)

exports.routify = ({ prefix, notFoundHandler = false } = {}) => (...routes) => {
  const router = new Router({ prefix })
  if (notFoundHandler) {
    router.setNotFoundHandler(notFoundHandler)
  }
  for (const route of routes) {
    router[addS](...route)
  }
  return router
}
