module.exports = {
  json({ status, body, headers = {} }) {
    headers['content-type'] = 'application/json'
    return { status, body: JSON.stringify(body), headers }
  },
  text({ status, body, headers = {} }) {
    headers['content-type'] = 'text/plain'
    return { status, body, headers }
  },
  html({ status, body, headers = {} }) {
    headers['content-type'] = 'text/html'
    return { status, body, headers }
  }
}
