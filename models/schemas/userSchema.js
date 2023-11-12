const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImageURL: String,
  firebaseUID: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  phoneNumber: String,
  address: {
    type: String
  },
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', null],
      default: null
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity cannot be less than 1!'],
      default: 1
    }
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  wishlist: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', null],
      default: null
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity cannot be less than 1!'],
      default: 1
    }
  }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});


module.exports = userSchema;