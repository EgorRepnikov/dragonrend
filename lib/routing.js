const Router = require('./Router')
const { addS } = require('./symbols')

exports.routing = ({ module = false, prefix, notFoundHandler = false } = {}) => {
  const router = new Router({ prefix })
  if (notFoundHandler) {
    router.setNotFoundHandler(notFoundHandler)
  }
  if (module) {
    module.exports = router
  }
  const route = (method, path, handlers) => router[addS](method, path, handlers)
  return {
    router,
    GET: (path, ...handlers) => route('GET', path, handlers),
    POST: (path, ...handlers) => route('POST', path, handlers),
    PUT: (path, ...handlers) => route('PUT', path, handlers),
    PATCH: (path, ...handlers) => route('PATCH', path, handlers),
    HEAD: (path, ...handlers) => route('HEAD', path, handlers),
    OPTIONS: (path, ...handlers) => route('OPTIONS', path, handlers),
    DELETE: (path, ...handlers) => route('DELETE', path, handlers)
  }
}
