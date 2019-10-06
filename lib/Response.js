const resS = Symbol('res')
const statusCodeS = Symbol('statusCode')
const headersS = Symbol('headers')
const isSentS = Symbol('isSent')
const sendS = Symbol('send')

module.exports = class Response {

  constructor(res) {
    this[resS] = res
    this[statusCodeS] = 200
    this[headersS] = {}
    this[isSentS] = false
  }

  header(key, value) {
    this[headersS][key] = value
    return this
  }

  status(statusCode) {
    this[statusCodeS] = statusCode
    return this
  }

  json(data) {
    this.header('content-type', 'application/json')
    this[sendS](JSON.stringify(data))
  }

  text(data) {
    this.header('content-type', 'text/plain')
    this[sendS](data)
  }

  html(data) {
    this.header('content-type', 'text/html')
    this[sendS](data)
  }

  send(data, contentType) {
    this.header('content-type', contentType)
    this[sendS](data)
  }

  [sendS](data) {
    this[isSentS] = true
    this.header('content-length', Buffer.byteLength(data))
    this[resS].writeHead(this[statusCodeS], this[headersS])
    this[resS].end(data, null, null)
  }
}
