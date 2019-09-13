module.exports = (array, ctx) =>
  array.reduce((previous, current) =>
    previous.then(() => !ctx.res.isSent && current(ctx)), Promise.resolve())
