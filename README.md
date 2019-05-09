# Dragonrend
Dragonrend is simple, fast and lightweight Node.js library for building web applications.

All these advantages are achieved due to the fact that there is nothing superfluous. You use only what you need. And then you get a speed comparable to bare Node.

# Installation
```bash
$ npm install dragonrend
```

# There Are 3 Ways To Use Dragonrend
Select an option for your needs.

## Bare Dragonrend
There is possible to use it as a router for Node's http module.

```js
const http = require('http')
const { Dragonrend } = require('dragonrend')

const app = new Dragonrend()

app.get('/hello', ({ req, res }) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.parse({ message: 'Hello World' }))
})

http
  .createServer(app.toListener())
  .listen(8080, () => console.log('Server has been started'))
```

## Dragonrend + Own Handlers
```js
const http = require('http')
const { Dragonrend } = require('dragonrend')

const app = new Dragonrend()

app.addHandlerBefore((data) => {
  data.request = {}
  const { req, request } = data
  return new Promise((resolve) => {
    const { req, request } = data
    let buffer = ''
    req.on('data', (chunk) => buffer += chunk)
    req.on('end', () => {
      request.body = JSON.parse(buffer)
      resolve()
    })
  })
})

app.addHandlerBefore((data) => data.response = {})

app.get('/hello', ({ request, response }) => {
  response.body = {
    request: request.body,
    message: 'Hello World'
  } // for example
  response.status = 200
})

app.addHandlerAfter(({ res, response }) => {
  res.writeHead(response.status, { 'Content-Type': contentType })
  res.end(JSON.parse(response.body))
})

http
  .createServer(app.toListener())
  .listen(8080, () => console.log('Server has been started'))
```

## Dragonrend + Handlers from NPM
```js
const http = require('http')
const { Dragonrend } = require('dragonrend')
const jsonBodyParser = require('dragonrend-json-body-parser')
const jsonResponse = require('dragonrend-response')

const app = new Dragonrend()

app.addHandlerBefore(jsonBodyParser.before)

app.addHandlerBefore(jsonResponse.before)

app.addHandlerAfter(jsonResponse.after)

app.get('/get', ({ request, response }) => {
  response.body = {
    request: request.body,
    message: 'Hello World'
  } // for example
})

http
  .createServer(app.toListener())
  .listen(8080)
```

# API
### data
**data** object is everywhere. This is a context that contains the request and response by default.

## Class Dragonrend
Dragonrend **inherits** Router

### addHandlerBefore
**addHandlerBefore** adds handler which will called before Router's handler.
```js
// async/await or return promise
dragonrend.addHandlerBefore(async (data) => {
  // do something
})
```

### addHandlerAfter
**addHandlerAfter** adds handler which will called after Router's handler.
```js
// async/await or return promise
dragonrend.addHandlerAfter(async (data) => {
  // do something
})
```

### setErrorHandler
**setErrorHandler** sets error handler.
By default Dragonrend returns status 500 and body {"error":"Internal Server Error"}
```js
dragonrend.setErrorHandler((error, data) => {
  data.res.writeHead(500, { 'Content-Type': 'application/json' })
  data.res.end(JSON.parse({ error }))
})
```

### toListener
**toListener** returns request listener for Node's http server.
```js
http
  .createServer(dragonrend.toListener())
  .listen(8080)
```

## Class Router

### constructor
Constructor gets the object with a prefix, which appends to all routes of that instance of Router.
```js
new Router({ prefix: '/api' })
```

### GET PUT PATCH POST DELETE HEAD OPTIONS
These methods add request handlers.
```js
const router = new Router()

router.get(async (data) => {
  // do something
})

router.post(({ req, res }) => {
  // do something
})
```

### merge
Merge combines one or more instances of Router.
```js
const router1 = new Router({ prefix: '/base' })
const router2 = new Router()
const router3 = new Router({ prefix: '/api' })

router1.merge(router2, router3)
```

### Instance of Router should be added to Dragonrend
Dragonrend inherits Router, therefore it has method **merge**.
```js
const dragonrend = new Dragonrend()
const router = new Router()
// add some handlers to router
dragonrend.merge(router)
// start server...
```
