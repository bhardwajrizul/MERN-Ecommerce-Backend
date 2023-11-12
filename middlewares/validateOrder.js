const { response } = require('../config')
const User = require('../models/userModel')
const Order = require('../models/orderModel') // Make sure to import the Order model

exports.validateOrder = async (req, res, next) => {
    const { uid } = req.body;

    // Check for unauthorized access
    if (req.user.uid !== uid) {
        return res.status(403).json({
            status: response.error,
            message: 'Unauthorized access.'
        });
    }

    // Retrieve the user and their cart
    const user = await User.findOne({ firebaseUID: uid }).populate({
        path: 'cart.product',
        select: 'name price discountPercent sizes quantity'
    });
    // console.log(user)

    // Check if the user exists and their cart is not empty
    if (!user) {
        return res.status(404).json({
            status: response.error,
            message: 'User not found.'
        });
    }
    if (user.cart.length === 0) {
        return res.status(400).json({
            status: response.error,
            message: 'The cart is empty.'
        });
    }

    // Calculate total amount and prepare updates (but do not execute them yet)
    let totalAmount = 0;
    let items = [];
    let userName = user.name;
    let userMail = user.email;
    let userPhone = user.phoneNumber;
    let userAddress = user.address;
    let mongoUserId = user._id;
    let ordersPlaced = user.orders.length


    if (!userPhone) {
        return res.status(400).json({
            status: response.error,
            userError: true,
            message: `Update your profile! Provide your CONTACT details before placing an order.`
        });
    }
    if (!userAddress) {
        return res.status(400).json({
            status: response.error,
            userError: true,
            message: `Update your profile! Add your ADDRESS before placing an order.`
        });
    }
    if (ordersPlaced > 5) {
        // console.log(ordersPlaced)
        return res.status(400).json({
            status: response.error,
            userError: true,
            message: `This is a dummy website. Maximum FIVE! orders can be placed by a single user`
        });
    }

    for (const item of user.cart) {
        const product = item.product;
        if (!product || product.quantity < item.quantity) {
            return res.status(400).json({
                status: response.error,
                userError: true,
                message: `Product ${product.name} requested ${item.quantity} but available only ${product.quantity}.`
            });
        }
        if (item.size && !product.sizes.includes(item.size)) {
            return res.status(400).json({
                status: response.error,
                userError: true,
                message: `Product ${product.name} is not available with the requested size ${item.size}.`
            });
        }
        totalAmount += Math.ceil((product.price - (product.price * (product.discountPercent / 100)))) * item.quantity;
        items.push({ product: product._id, quantity: item.quantity, size: item.size });
    }


    // Store the details in req object to use later
    req.totalAmount = totalAmount;
    req.items = items;
    req.mongoUserId = mongoUserId;
    req.userMail = userMail;
    req.userPhone = userPhone;
    req.userName = userName;
    req.userAddress = userAddress;


    next();
};
