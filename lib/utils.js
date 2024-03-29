exports.compose = middlewares => (ctx, next) => {
  const dispatch = i => {
    let fn = middlewares[i]
    if (i === middlewares.length) {
      fn = next
    }
    if (!fn) {
      return Promise.resolve()
    }
    try {
      return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
    } catch (err) {
      return Promise.reject(err)
    }
  }
  return dispatch(0)
}

exports.createResponse = res => ({
  raw: res,
  _statusCode: 200,
  _headers: {},
  header(key, value) {
    this._headers[key] = value
    return this
  },
  status(statusCode) {
    this._statusCode = statusCode
    return this
  },
  json(data) {
    this.header('content-type', 'application/json')
    this._send(JSON.stringify(data))
  },
  text(data) {
    this.header('content-type', 'text/plain')
    this._send(data)
  },
  html(data) {
    this.header('content-type', 'text/html')
    this._send(data)
  },
  send(data = '') {
    this._send(data)
  },
  _send(data) {
    this.header('content-length', Buffer.byteLength(data))
    this.raw.writeHead(this._statusCode, this._headers)
    this.raw.end(data, null, null)
  }
})
