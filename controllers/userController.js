const User = require('../models/userModel')
const catchAsyncError = require('../utils/catchAsyncError')
const { response } = require('../config')
const mongoose = require('mongoose')
const Product = require('../models/productModel')
const Order = require('../models/orderModel');



exports.addUser = catchAsyncError(async (req, res, next) => {
  const { uid, email, name } = req.body;

  let userCount = await User.countDocuments();
  if (userCount >= 50) {
    return res.status(403).json({
      success: false,
      message: 'No new accounts allowed.'
    });
  }

  let existingUser = await User.findOne({
    $or: [{ email }, { firebaseUID: uid }]
  });


  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or UID already exists.'
    });
  }

  // Create a new user and use the 'save' method to trigger hooks.
  const newUser = new User({
    name,
    email,
    firebaseUID: uid,
  });

  try {
    // The 'save' method returns a promise which resolves when the
    // document is saved and post-save hooks, if any, are complete.
    const savedUser = await newUser.save();
    // At this point, the user is saved, and you can send back a response.
    res.status(201).json({
      success: true,
      data: savedUser
    });
  } catch (err) {
    // Handle error.
    return next(err);
  }
});



exports.getUser = catchAsyncError(async (req, res, next) => {
  const uidParam = req.params.uid;
  if (req.user.uid !== uidParam) {
    return res.status(403).send('Unauthorized access.');
  }
  const user = await User.findOne({ firebaseUID: uidParam });  // Find user by uid
  // console.log(user)
  if (!user) {
    return res.status(404).send({ message: 'User not found.' });
  }

  res.status(200).json(user);
});

exports.updateUserDetails = catchAsyncError(async (req, res, next) => {
  // console.log(req.userUpdates)
  const uidParam = req.params.uid;
  if (req.user.uid !== uidParam) {
    return res.status(403).send('Unauthorized access.');
  }

  //use the sanitized updates from the middleware
  const user = await User.findOneAndUpdate(
    { firebaseUID: uidParam },
    { $set: req.userUpdates },  //userUpdates comes from validateUserUpdate middleware 
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).send('User not found.');
  }

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    user
  });
});

exports.addToWishlist = catchAsyncError(async (req, res, next) => {
  const { uid } = req.params;

  if (req.user.uid !== uid) {
    return res.status(403).send('Unauthorized access.');
  }

  const { pid, quantity, size } = req.body;

  // Validate size
  const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', null];
  if (size && !validSizes.includes(size)) {
    return res.status(400).json({
      status: response.error,
      message: 'Invalid size, valid sizes are XS, S, M, L, XL, XXL.'
    });
  }

  // Validate quantity
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
    return res.status(400).json({
      status: response.error,
      message: 'Invalid quantity, it must be a number between 1 and 9.'
    });
  }

  try {
    const user = await User.findOne({ firebaseUID: uid });

    if (!user) {
      return res.status(404).json({
        status: response.error,
        message: 'User not found'
      });
    }

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: response.error, message: 'Product not found' });
    }


    // Make sure size of wishlist doesnt grow indefinitely 
    if (user.wishlist.length > 50) {
      return res.status(400).json({ status: response.error, message: 'Too many items inside wishlist' });
    }

    // Find an item in the wishlist that matches both the product ID and the size
    const existingWishlistItemIndex = user.wishlist.findIndex(item =>
      item.product.toString() === pid && (size == null || item.size === size)
    );

    if (existingWishlistItemIndex > -1) {
      // Product with the same size exists, update the quantity (not exceeding max quantity)
      user.wishlist[existingWishlistItemIndex].quantity = Math.min(user.wishlist[existingWishlistItemIndex].quantity + quantity, 9);
    } else {
      user.wishlist.push({
        product: pid,
        quantity,
        size
      });
    }

    // Save the user with the updated wishlist
    let updatedUser = await user.save();
    // console.log(updatedUser.wishlist)
    // Send back a success response
    res.status(201).json({
      status: response.success,
      data: {
        wishlist: user.wishlist
      }
    });

  } catch (error) {
    next(error);
  }
});

exports.getWishlist = catchAsyncError(async (req, res, next) => {
  const uidParam = req.params.uid;
  if (req.user.uid !== uidParam) {
    return res.status(403).send('Unauthorized access.');
  }

  try {
    const user = await User.findOne({ firebaseUID: uidParam })
      .populate({
        path: 'wishlist.product',
        select: 'name price image discountPercent availability quantity' // fields to include from the Product model
      });

    if (!user) {
      return res.status(404).json({
        status: response.error,
        message: 'User not found'
      });
    }

    // Check if all populated products are valid (i.e., not null which means they exist in the database)
    const validWishlistItems = user.wishlist.filter(item => item.product !== null);

    // Send back the valid wishlist items
    return res.status(200).json({
      status: response.success,
      data: {
        wishlist: validWishlistItems
      }
    });
  } catch (error) {
    return next(error);
  }
});

exports.deleteFromWishlist = catchAsyncError(async (req, res, next) => {
  const uidParam = req.params.uid;
  if (req.user.uid !== uidParam) {
    return res.status(403).send('Unauthorized access.');
  }

  const { pid, size } = req.body;

  try {
    const user = await User.findOne({ firebaseUID: uidParam });

    if (!user) {
      return res.status(404).json({
        status: response.error,
        message: 'User not found'
      });
    }

    // Find the index of the wishlist item to remove
    const itemIndex = user.wishlist.findIndex(item => {
      return item.product.toString() === pid && (size == null || item.size === size);
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        status: response.error,
        message: 'Wishlist item not found'
      });
    }

    // Remove the item from the wishlist array
    user.wishlist.splice(itemIndex, 1);

    // Save the user document with the updated wishlist
    await user.save();

    // Return a success response
    res.status(200).json({
      status: response.success,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    return next(error);
  }
});

exports.getCartItems = catchAsyncError(async (req, res, next) => {
  const uidParam = req.params.uid;

  // Check if the authenticated user's UID matches the requested UID
  if (req.user.uid !== uidParam) {
    return res.status(403).json({
      status: response.error,
      message: 'Unauthorized access.'
    });
  }

  try {
    // Fetch the user and populate the product details in the cart
    const user = await User.findOne({ firebaseUID: uidParam })
      .populate({
        path: 'cart.product',
        select: 'name price image discountPercent' // Add 'discountPercent' if it's relevant to cart items
      });

    if (!user) {
      return res.status(404).json({
        status: response.error,
        message: 'User not found'
      });
    }

    // Check if all populated products in the cart are valid (i.e., not null)
    const validCartItems = user.cart.filter(item => item.product !== null);


    // Send back the valid cart items
    return res.status(200).json({
      status: response.success,
      data: {
        cart: validCartItems
      }
    });
  } catch (error) {
    // Handle any potential errors
    next(error);
  }
});

exports.addToCart = catchAsyncError(async (req, res, next) => {
  const { uid } = req.params;
  const { pid, quantity, size } = req.body;

  if (req.user.uid !== uid) {
    return res.status(403).json({ status: response.error, message: 'Unauthorized access.' });
  }

  // Validate pid
  if (!mongoose.Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ status: response.error, message: 'Invalid product ID.' });
  }

  // Validate size
  const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', null];
  if (size && !validSizes.includes(size)) {
    return res.status(400).json({ status: response.error, message: 'Invalid size, valid sizes are XS, S, M, L, XL, XXL.' });
  }

  // Validate quantity
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
    return res.status(400).json({ status: response.error, message: 'Invalid quantity, it must be a number between 1 and 9.' });
  }

  try {
    const user = await User.findOne({ firebaseUID: uid });

    if (!user) {
      return res.status(404).json({ status: response.error, message: 'User not found' });
    }

    // Check if the product exists in the database before adding to cart
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: response.error, message: 'Product not found' });
    }

    // Make sure size of cart doesnt grow indefinitely 
    if (user.cart.length > 50) {
      return res.status(400).json({ status: response.error, message: 'Too many items inside cart' });
    }

    // Find an item in the cart that matches both the product ID and the size
    const existingCartItemIndex = user.cart.findIndex(item =>
      item.product.toString() === pid && (size == null || item.size === size)
    );

    if (existingCartItemIndex > -1) {
      // Update quantity if the same product and size already exist in the cart
      user.cart[existingCartItemIndex].quantity = Math.min(user.cart[existingCartItemIndex].quantity + quantity, 9);
    } else {
      // Add new item to the cart if it doesn't exist
      user.cart.push({ product: pid, quantity, size });
    }

    // Save the user with the updated cart
    await user.save();

    // Send back a success response with the updated cart
    res.status(201).json({ status: response.success, data: { cart: user.cart } });

  } catch (error) {
    next(error);
  }
});

exports.deleteFromCart = catchAsyncError(async (req, res, next) => {
  const uidParam = req.params.uid;
  const { pid, size } = req.body;

  if (req.user.uid !== uidParam) {
    return res.status(403).json({ status: response.error, message: 'Unauthorized access.' });
  }

  // Validate pid
  if (!mongoose.Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ status: response.error, message: 'Invalid product ID.' });
  }

  try {
    const user = await User.findOne({ firebaseUID: uidParam });

    if (!user) {
      return res.status(404).json({ status: response.error, message: 'User not found' });
    }

    // Find the index of the cart item to remove
    const itemIndex = user.cart.findIndex(item => {
      return item.product.toString() === pid && (size == null || item.size === size);
    });

    if (itemIndex === -1) {
      return res.status(404).json({ status: response.error, message: 'Cart item not found' });
    }

    // Remove the item from the cart array
    user.cart.splice(itemIndex, 1);

    // Save the user document with the updated cart
    await user.save();

    // Return a success response
    res.status(200).json({
      status: response.success,
      message: 'Item removed from cart',
      data: { cart: user.cart }
    });
  } catch (error) {
    return next(error);
  }
});


exports.getOrders = catchAsyncError(async (req, res, next) => {
  const uidParam = req.params.uid;
  // Check if the authenticated user's UID matches the requested UID
  if (req.user.uid !== uidParam) {
    return res.status(403).json({
      status: response.error,
      message: 'Unauthorized access.'
    });
  }
  try {
    const user = await User.findOne({ firebaseUID: uidParam });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.'
      });
    }
    const orders = await Order.find({ user: user._id })
      .populate({
        path: 'items.product',
        select: '_id image name' // Only fetch the _id, image, and name fields from the product
      })
      .exec(); // Execute the query

    res.status(200).json({
      status: 'success',
      result: orders.length,
      data: {
        orders: orders,
      },
    });
  } catch (error) {
    console.error('Failed to retrieve orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving orders',
    });
  }
});

