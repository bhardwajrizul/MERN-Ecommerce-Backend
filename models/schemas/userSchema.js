const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImageURL: String,
  firebaseUID: {type: String, required: true},
  role: { type: String, enum: ['user', 'admin', 'seller'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  phoneNumber: String,
  addresses: [{
      type: String
  }],
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  reviews:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});


module.exports = userSchema;