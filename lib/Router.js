const Impetuous = require('impetuous')

module.exports = class Router extends Impetuous {

  #prefix
  #tempRoutes = []

  constructor({ prefix = '' } = {}) {
    super()
    this.#prefix = prefix
  }

  get tempRoutes() {
    return this.#tempRoutes
  }

  get(path, handler) {
    return this.#add('GET', path, handler)
  }

  post(path, handler) {
    return this.#add('POST', path, handler)
  }

  put(path, handler) {
    return this.#add('PUT', path, handler)
  }

  patch(path, handler) {
    return this.#add('PATCH', path, handler)
  }

  head(path, handler) {
    return this.#add('HEAD', path, handler)
  }

  options(path, handler) {
    return this.#add('OPTIONS', path, handler)
  }

  delete(path, handler) {
    return this.#add('DELETE', path, handler)
  }

  #add = (method, path, handler) => {
    const pathWithPrefix = this.#prefix + path
    this.#tempRoutes.push({ method, path: pathWithPrefix, handler })
    return super.add(method, pathWithPrefix, handler)
  }

  execute(ctx) {
    const { method, url } = ctx.req
    const route = super.find(method, url)
    if (route === null) {
      const { res } = ctx
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(`{"error":"Not Found"}`)
      return Promise.resolve()
    }
    const { params, query, handler } = route
    ctx.params = params
    ctx.query = query
    return handler(ctx)
  }

  merge(...routers) {
    for (const router of routers) {
      for (const { method, path, handler } of router.tempRoutes) {
        this.#add(method, path, handler)
      }
    }
  }
}
