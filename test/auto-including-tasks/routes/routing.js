const { routing } = require('../../../')

routing({ module }).GET('/routing', ctx => ctx.response.text('routing'))
