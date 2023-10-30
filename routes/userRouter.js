const express = require('express')
const userController = require('../controllers/userController')

const authMiddleware = require('../middlewares/authMiddleware')

const userRouter = express.Router();
userRouter.route('/addUser').post(
    authMiddleware.verifyIdToken,
    userController.addUser
)


module.exports = userRouter;