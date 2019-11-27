module.exports = {
  contentType: 'text/plain',
  parse(body) {
    return body.toUpperCase()
  }
}