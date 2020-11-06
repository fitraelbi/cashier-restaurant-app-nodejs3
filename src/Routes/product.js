const express = require('express')
const controller = require('../Controller/index')
const router = express.Router()
const { cache, client } = require('../Helper/redis')
const { verifyAccessToken } = require('../Helper/jwt_helpers')

router.get('/', verifyAccessToken, cache.menu, controller.product.getAll)
router.post('/', controller.product.add)
router.put('/', client.flushdb, controller.product.update)
router.delete('/', controller.product.delete)

router.get('/search', controller.product.search)

router.get('/orderbyname', cache.orderName, controller.product.orderbyname)
router.get('/orderbycategory', cache.orderCategory, controller.product.orderbycategory)
router.get('/orderbynew', cache.orderNew, controller.product.orderbynew)
router.get('/orderbypricelow', cache.orderPriceLow, controller.product.orderbypricelow)
router.get('/orderbypricehigh', cache.orderPriceHigh, controller.product.orderbypricehigh)

module.exports = router
