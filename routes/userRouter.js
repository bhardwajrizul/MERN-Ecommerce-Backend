const express = require('express')
const userController = require('../controllers/userController')

const authMiddleware = require('../middlewares/authMiddleware')
const { validateUserUpdate } = require('../middlewares/validateUserUpdate')

const userRouter = express.Router();

userRouter.route('/:uid/orders')
    .get(
        authMiddleware.verifyIdToken,
        userController.getOrders // Use the getWishlist function for GET requests
    )


userRouter.route('/:uid/wishlist')
    .get(
        authMiddleware.verifyIdToken,
        userController.getWishlist // Use the getWishlist function for GET requests
    )
    .post(
        authMiddleware.verifyIdToken,
        userController.addToWishlist // Use the addToWishlist function for POST requests
    )
    .delete(
        authMiddleware.verifyIdToken,
        userController.deleteFromWishlist
    )

userRouter.route('/:uid/cart')
    .get(
        authMiddleware.verifyIdToken,
        userController.getCartItems // Use the getWishlist function for GET requests
    )
    .post(
        authMiddleware.verifyIdToken,
        userController.addToCart // Use the addToWishlist function for POST requests
    )
    .delete(
        authMiddleware.verifyIdToken,
        userController.deleteFromCart
    )

userRouter.route('/:uid')
    .get(
        authMiddleware.verifyIdToken,
        userController.getUser
    )
    .patch(
        authMiddleware.verifyIdToken,
        validateUserUpdate(['phoneNumber', 'name', 'address']),
        userController.updateUserDetails
    );

userRouter.route('/addUser').post(
    authMiddleware.verifyIdToken,
    userController.addUser
)



module.exports = userRouter;