
const express = require('express');
const orderController = require('../controllers/orderController');
const validateOrder = require('../middlewares/validateOrder');
const authMiddleware = require('../middlewares/authMiddleware')
const createRazorpayOrder = require('../controllers/createRazorpayOrder')

const orderRouter = express.Router();

// Route to handle order placement
orderRouter.route('/placeOrder')
    .post(
        authMiddleware.verifyIdToken,
        validateOrder.validateOrder,
        createRazorpayOrder.createRazorpayOrder
    )

orderRouter.route('/confirmOrder')
    .post(
        orderController.paymentVerification
    )
    .get(
        authMiddleware.verifyIdToken,
        orderController.verifyOrderStatus
    )


module.exports = orderRouter;
