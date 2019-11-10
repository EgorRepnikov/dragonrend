const Router = require('../../../lib/Router')

const router = new Router()

router.post('/parser', (ctx) => ctx.response.text(ctx.request.body))

module.exports = router
