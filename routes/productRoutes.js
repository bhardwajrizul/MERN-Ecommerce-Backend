const express = require('express')
const productController = require('../controllers/productController')

const productRouter = express.Router();
productRouter.route('/').get(productController.getProducts)
productRouter.route('/test').get(productController.testController)


module.exports = productRouter;