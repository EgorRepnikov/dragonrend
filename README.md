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
const { Dragonrend } = require('dragonrend')

const app = new Dragonrend()

app.get('/hello', ({ req, res }) => {
  // Do something with 'req'
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.parse({ message: 'Hello World' }))
})

app.toServer().listen(8080)
```

## Dragonrend + Own Handlers
```js
const { Dragonrend } = require('dragonrend')

const app = new Dragonrend()

app.middleware((ctx) => {
  ctx.request = {}
  return new Promise((resolve) => {
    const { req, request } = ctx
    let buffer = ''
    req.on('data', (chunk) => buffer += chunk)
    req.on('end', () => {
      request.body = JSON.parse(buffer)
      resolve()
    })
  })
})

app.middleware((ctx) => ctx.response = {})

app.setRootHandler(({ res, response }) => {
  res.writeHead(response.status, { 'Content-Type': 'application/json' })
  res.end(JSON.parse(response.body))
})

app.get('/hello', ({ request, response }) => {
  response.body = {
    request: request.body,
    message: 'Hello World'
  }
  response.status = 200
})

app.toServer().listen(8080)
```

## Dragonrend + Handlers from NPM
```js
const { Dragonrend } = require('dragonrend')
const jsonBodyParser = require('dragonrend-json-body-parser')
const response = require('dragonrend-response')

const app = new Dragonrend()

// These handlers are configured themselves
jsonBodyParser(app)
response(app)

app.get('/get', ({ request, response }) => {
  response.body = {
    request: request.body,
    message: 'Hello World'
  }
})

app.toServer().listen(8080)
```

# API
### ctx
This is a context that contains the request `req` and response `res` by default.

## Class Dragonrend
`Dragonrend` **inherits** `Router` (`Router` inherits [Impetuous](https://github.com/EgorRepnikov/impetuous) in turn).

### baseContext
Stores the values you can get from `ctx`.

```js
// add value
dragonrend.baseContext.someValue = {}

dragonrend.get('/path', (ctx) => {
  const { someValue } = ctx // <- and use it
})
```

### middleware(...fns)
Adds handler which will called before Router's handler.

`fns` Type: `Function|Array<Function>`

```js
// async/await or return promise
dragonrend.middleware(async (ctx) => {
  // do something
})
```

### setRootHandler(fn)
Sets App's root handler. Therefore it will be called after all middleware handlers.
By default Dragonrend returns status 200 and body `OK` with content type `text/plain`.

`fn` Type: `Function`

```js
dragonrend.setRootHandler((ctx) => {
  const { res, response } = ctx
  res.writeHead(response.status, { 'Content-Type': 'application/json' })
  res.end(JSON.parse(response.body))
})
```

### setErrorHandler(fn)
Sets error handler.
By default Dragonrend returns status 500 and body `{"error":"Internal Server Error"}`.

`fn` Type: `Function`

`fn` should have `(e, ctx)` signature. `e` is an error occurred, `ctx` is context.

```js
dragonrend.setErrorHandler((error, ctx) => {
  ctx.res.writeHead(500, { 'Content-Type': 'application/json' })
  ctx.res.end(JSON.parse({ error }))
})
```

### toListener()
Returns request listener for Node's http server.

```js
http
  .createServer(dragonrend.toListener())
  .listen(8080)
```

### toServer()
Returns instance of Server with installed `requestListener`.

```js
dragonrend.toServer().listen(8080)
```

## Class Router

`Router` **inherits** [Impetuous](https://github.com/EgorRepnikov/impetuous).

### constructor
Gets the object with a prefix (not required), which appends to all routes of that instance of Router.

```js
new Router({ prefix: '/api' })
```

### GET PUT PATCH POST DELETE HEAD OPTIONS (path, fn)
These methods add request handlers.

`path` Type: `String`

`fn` Type: `Function`

```js
const router = new Router()

router.get('/path/:param', async (ctx) => {
  // do something
})

router.post('/path', ({ req, res }) => {
  // do something
})
```

### merge(...routers)
Combines one or more instances of Router.

Type: Router|Array<Router>

```js
const router1 = new Router({ prefix: '/base' })
const router2 = new Router()
const router3 = new Router({ prefix: '/api' })

router1.merge(router2, router3)
```

### Instance of Router should be added to Dragonrend
`Dragonrend` inherits `Router`, therefore it has method `merge`.

```js
const dragonrend = new Dragonrend()
const router = new Router()
// add some handlers to router
dragonrend.merge(router)
// start server...
```

# Author
**Egor Repnikov** - [GitHub](https://github.com/EgorRepnikov)

# License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
