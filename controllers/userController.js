const User = require('../models/userModel')
const catchAsyncError = require('../utils/catchAsyncError')
const { response } = require('../config')

exports.addUser = catchAsyncError(async (req, res, next) => {
    // Extract user details from request body
    const { uid, email, name } = req.body;

    // Check if a user with the same email or firebaseUID already exists
    let existingUser = await User.findOne({ $or: [{ email }, { firebaseUID: uid }] });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User with this email or UID already exists.'
        });
    }

    const newUser = await User.create({
        name,
        email,
        firebaseUID: uid,
    });

    res.status(201).json({
        success: true,
        data: newUser
    });
});