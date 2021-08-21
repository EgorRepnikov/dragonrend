import * as http from 'http'

export type Object = { [key: string]: any }

export interface DragonrendRequest {
  headers: Object
  url: string
  method: string
  raw: http.ClientRequest
  path: string
  query(): Promise<Object>
  body(): Promise<any>
}

export interface DragonrendResponse {

  raw: http.ServerResponse

  header(key: string, value: string): DragonrendResponse

  status(statusCode: number): DragonrendResponse

  json(data: string): DragonrendResponse

  text(data: string): DragonrendResponse

  html(data: string): DragonrendResponse

  send(data?: string): DragonrendResponse
}

export interface BaseContext {
  request: DragonrendRequest
  response: DragonrendResponse
}

export type Middleware = <Context extends BaseContext>(ctx: Context, next?: () => Promise<any>) => any

export interface RoutingOptions<Context extends BaseContext> {
  prefix?: string
  notFoundHandler?: (ctx: Context) => any
}

export interface Dragonrend<Context extends BaseContext> {

  MIDDLEWARE: (...fns: Middleware[]) => Dragonrend<Context>

  CONTEXT: (ctx: Partial<Context>) => Dragonrend<Context>

  PARSER: (contentType: string, handler: (body: string) => any) => Dragonrend<Context>

  CATCH_ERROR: (handler: (error: any, ctx: Context) => any) => Dragonrend<Context>

  START: (portOrOptions: number | Object, cb?: (err: any) => any) => void

  STOP: (cb?: () => any) => Promise<any> | void

  middleware(...fns: Middleware[]): Dragonrend<Context>

  context(ctx: Partial<Context>): Dragonrend<Context>

  addContentTypeParser(contentType: string, handler: (body: string) => any): Dragonrend<Context>

  setErrorHandler(handler: (error: any, ctx: Context) => any): Dragonrend<Context>

  start(portOrOptions: number | Object, cb?: (err: any) => any): void

  stop(cb?: () => any): Promise<any> | void
}

interface Router<Context extends BaseContext> {

  GET: (path: string, ...handlers: Middleware[]) => Router<Context>

  POST: (path: string, ...handlers: Middleware[]) => Router<Context>

  PUT: (path: string, ...handlers: Middleware[]) => Router<Context>

  PATCH: (path: string, ...handlers: Middleware[]) => Router<Context>

  HEAD: (path: string, ...handlers: Middleware[]) => Router<Context>

  OPTIONS: (path: string, ...handlers: Middleware[]) => Router<Context>

  DELETE: (path: string, ...handlers: Middleware[]) => Router<Context>

  MERGE: (...routers: Router<Context>[]) => Router<Context>

  NOT_FOUND: (handler: (ctx: Context) => any) => Router<Context>

  get(path: string, ...handlers: Middleware[]): Router<Context>

  post(path: string, ...handlers: Middleware[]): Router<Context>

  put(path: string, ...handlers: Middleware[]): Router<Context>

  patch(path: string, ...handlers: Middleware[]): Router<Context>

  head(path: string, ...handlers: Middleware[]): Router<Context>

  options(path: string, ...handlers: Middleware[]): Router<Context>

  delete(path: string, ...handlers: Middleware[]): Router<Context>

  merge(...routers: Router<Context>[]): Router<Context>

  setNotFoundHandler(handler: (ctx: Context) => any): Router<Context>
}

export function dragonrend<Context extends BaseContext>(options?: {
  server?: boolean,
  https?: boolean,
  http2?: boolean,
  noDelay?: boolean,
  routing?: RoutingOptions<Context>,
  autoIncluding?: boolean,
  errorHandler?: (e: any, ctx: Context) => any,
}): Dragonrend<Context>

export function routing<Context extends BaseContext>(options?: RoutingOptions<Context>): Router<Context>

export function json(body: Object)
export function json(status: number, body: Object)
export function json(status: number, headers: Object, body: Object)

export function text(body: string)
export function text(status: number, body: string)
export function text(status: number, headers: Object, body: string)

export function html(body: string)
export function html(status: number, body: string)
export function html(status: number, headers: Object, body: string)

export function returnable(fn: Middleware)
