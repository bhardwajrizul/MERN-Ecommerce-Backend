const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1!'],
      max: [9, 'Quantity cannot be more than 10!']
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', null],
      default: null
    }
  }],
  transaction_id: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Not processed',
    enum: ['Failed', 'Pending', 'Paid']
  },
  updated: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = orderSchema