const Razorpay = require('razorpay');
const catchAsyncError = require('../utils/catchAsyncError')
const { response } = require('../config');
const Order = require('../models/orderModel')
const User = require('../models/userModel')

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

exports.createRazorpayOrder = catchAsyncError(async (req, res) => {
  try {
    const {
      totalAmount,
      pendingOrderId,
      userMail,
      userPhone,
      userName,
      userAddress,
      mongoUserId,
      items,

    } = req; // Retrieve the pending order details from the request
    // console.log(totalAmount);
    const options = {
      amount: totalAmount * 100, // Razorpay expects the amount in the smallest currency unit
      currency: "INR",
      receipt: `order_rcptid_${pendingOrderId}`, // use this for a custom receipt number
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create a pending order in the database
    const pendingOrder = await Order.create({
      user: mongoUserId,
      items: items,
      transaction_id: razorpayOrder.id,
      address: userAddress,
      amount: totalAmount,
      status: 'Pending', // Indicates that payment has not yet been received
      // Include any other necessary fields
    });

    // update the User document by adding the new order's ID to the orders array
    await User.findByIdAndUpdate(mongoUserId, {
      $push: { orders: pendingOrder._id },
      $set: { cart: [] }  // This will clear the user's cart
    }, { new: true }); // { new: true } will return the updated document



    res.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      status: response.success,
      name: userName,
      mail: userMail,
      phone: userPhone,
      razorpayKey: process.env.KEY_ID,
    });
  } catch (error) {
    console.error(error); // Log the full error
    res.status(500).json({ error: error.message });
  }
});
