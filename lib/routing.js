const Router = require('./Router')
const { addS } = require('./symbols')

exports.GET = 'GET'
exports.POST = 'POST'
exports.PUT = 'PUT'
exports.PATCH = 'PATCH'
exports.HEAD = 'HEAD'
exports.OPTIONS = 'OPTIONS'
exports.DELETE = 'DELETE'

exports.routify = ({ prefix, notFoundHandler = false } = {}) => (routes = []) => {
  const router = new Router({ prefix })
  if (notFoundHandler) {
    router.setNotFoundHandler(notFoundHandler)
  }
  for (const route of routes) {
    router[addS](route[0], route[1], route.slice(2, route.length))
  }
  return router
}
