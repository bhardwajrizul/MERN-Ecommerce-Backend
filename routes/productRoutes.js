const express = require('express')
const productController = require('../controllers/productController')

const productRouter = express.Router();
productRouter.route('/').get(productController.getProducts)
productRouter.route('/:pid').get(productController.getProductInfo)
productRouter.route('/test').get(productController.testController)


module.exports = productRouter;