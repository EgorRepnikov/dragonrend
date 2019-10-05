module.exports = class Response {

  constructor(res) {
    this.res = res
    this.statusCode = 200
    this.headers = {}
    this.isSent = false
  }

  header(key, value) {
    this.headers[key] = value
    return this
  }

  status(statusCode) {
    this.statusCode = statusCode
    return this
  }

  json(data) {
    this.header('content-type', 'application/json')
    this._send(JSON.stringify(data))
  }

  text(data) {
    this.header('content-type', 'text/plain')
    this._send(data)
  }

  html(data) {
    this.header('content-type', 'text/html')
    this._send(data)
  }

  custom(data, contentType) {
    this.header('content-type', contentType)
    this._send(data)
  }

  _send(data) {
    this.isSent = true
    this.header('content-length', Buffer.byteLength(data))
    this.res.writeHead(this.statusCode, this.headers)
    this.res.end(data, null, null)
  }
}
