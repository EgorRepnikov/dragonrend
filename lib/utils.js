exports.reduce = (array, ctx) => {
  return array.reduce((previous, current) => {
    return previous.then(() => !ctx.response.isSent && current(ctx))
  }, Promise.resolve())
}
