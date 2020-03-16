module.exports = class Response {

  constructor(res) {
    this.raw = res
    this._statusCode = 200
    this._headers = {}
  }

  header(key, value) {
    this._headers[key] = value
    return this
  }

  status(statusCode) {
    this._statusCode = statusCode
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

  send(data) {
    this._send(data)
  }

  _send(data) {
    this.header('content-length', Buffer.byteLength(data))
    this.raw.writeHead(this._statusCode, this._headers)
    this.raw.end(data, null, null)
  }
}
