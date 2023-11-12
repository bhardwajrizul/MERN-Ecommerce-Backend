// controllers/orderController.js

const User = require('../models/userModel'); // The User model
const Product = require('../models/productModel'); // The Product model
const Order = require('../models/orderModel'); // The Order model you've created
const { response } = require('../config');
const catchAsyncError = require('../utils/catchAsyncError');
const crypto = require('crypto');
const mongoose = require('mongoose')



exports.verifyOrderStatus = async (req, res, next) => {
  const { user_id, order_id } = req.query;

  // Retrieve the user's Firebase UID from the verified ID token
  const firebaseUID = req.user.uid;

  if (firebaseUID !== user_id) {
    return res.status(403).send('Unauthorized access.');
  }
  try {
    // Look up the order by ID and ensure it belongs to the user with the matching Firebase UID
    const user = await User.findOne({ firebaseUID: firebaseUID });
    const order = await Order.findOne({ _id: order_id, user: user._id });

    if (!order) {
      return res.status(404).json({
        status: response.error,
        message: 'Order not found or does not belong to the current user.'
      });
    }

    // Respond with the order status
    res.status(200).json({
      status: response.success,
      data: {
        orderId: order._id,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    console.error('Failed to verify order status:', error);
    res.status(500).json({
      status: response.error,
      message: 'An error occurred while verifying the order status.'
    });
  }
};


exports.paymentVerification = catchAsyncError(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const secret = process.env.KEY_SECRET;

  // Create a signature using HMAC SHA256 algorithm
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  // Compare the signatures
  if (generated_signature === razorpay_signature) {
    // console.log('Payment is successful');

    // Find the order by transaction_id (razorpay_order_id)
    const order = await Order.findOne({ transaction_id: razorpay_order_id }).populate('items.product');

    if (order) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Update order status
        order.status = 'Paid';
        order.updated = new Date();
        await order.save({ session });

        // Prepare bulk operation to update product quantities
        const bulkOps = order.items.map(item => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: 0 } } // For dummy website decrease by 0
            // update: { $inc: { quantity: -item.quantity } } // For real website decrease by ordered value

          }
        }));

        // Execute bulk operation
        await Product.bulkWrite(bulkOps, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Redirect to success page
        // res.redirect(`http://localhost:5173/paymentConfirm?order_id=${order._id}`); // DEV
        res.redirect(`https://mern-e-commerce-theta.vercel.app/paymentConfirm?order_id=${order._id}`); // PROD
      } catch (error) {
        // If an error occurred, abort the transaction
        await session.abortTransaction();
        session.endSession();

        console.error('Failed to update product quantities:', error);
        // res.redirect('http://localhost:5173/paymentConfirm?status=error'); // DEV
        res.redirect('https://mern-e-commerce-theta.vercel.app/paymentConfirm?status=error'); // PROD
      }
    } else {
      // console.log('Order not found or payment signature mismatch');
      // res.redirect('http://localhost:5173/paymentConfirm?status=failed');  // DEV
      res.redirect('https://mern-e-commerce-theta.vercel.app/paymentConfirm?status=failed');  // PROD
    }
  } else {
    // console.log('Payment signature mismatch');
    // res.redirect('http://localhost:5173/paymentConfirm?status=failed'); // DEV
    res.redirect('https://mern-e-commerce-theta.vercel.app/paymentConfirm?status=failed'); // PROD
  }
});

