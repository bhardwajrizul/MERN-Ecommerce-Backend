const { categorySchema } = require('./schemas/categorySchema')
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const productSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    productImages: [{
        type: String,
        validate: {
            validator: function (value) {
                return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }],
    name: {
        type: String,
        required: true,
        maxlength: [100, 'Product name should not exceed 100 characters!']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price should not be negative!'],
        max: [100000, 'Price is unrealistically high!'] // Example upper limit
    },
    discountPercent: {
        type: Number,
        required: true,
        min: [1, 'Discount percent should not be less than 1!'],
        max: [50, 'Discount percent should not exceed 50!']
    },
    description: {
        type: String,
        required: true,
        maxlength: [500, 'Description should not exceed 500 characters!']
    },
    categories: [categorySchema],

    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'unisex'],
            message: 'Gender `{VALUE}` is not valid!'
        },
        required: true
    },

    brand: {
        type: String,
        required: true,
        maxlength: [50, 'Brand name should not exceed 50 characters!']
    },
    // Sizes available for the product, assuming multiple sizes can be available
    sizes: [{
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', null],
        default: null 
    }],

    // Quantity available in stock
    quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative!']
    },

    // Reference to reviews in the reviews collection
    reviews: [{
        type: ObjectId,
        ref: 'Review'
    }],
    rating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },

    // Whether the product is available or not
    availability: {
        type: Boolean,
        default: true
    }

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
