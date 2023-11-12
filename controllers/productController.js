const APIFeatures = require('../utils/API-features')
const Product = require('../models/productModel')
const catchAsyncError = require('../utils/catchAsyncError')
const { response } = require('../config')

exports.getProducts = catchAsyncError(async (req, res, next) => {
    // Initialize the base query
    const baseQuery = Product.find();

    // Apply filters to the base query
    const modifyMongooseQuery = new APIFeatures(baseQuery, req.query);
    // modifyMongooseQuery.populate('rating').populate('ratingCount')
    modifyMongooseQuery.filter();
    const filteredProductsQuery = modifyMongooseQuery.query;

    // Clone the filtered query for counting documents
    const countFilteredProducts = filteredProductsQuery.clone();

    // Calculate the total number of products after applying filters
    const totalProducts = await countFilteredProducts.countDocuments();

    // Apply pagination to the filtered query
    modifyMongooseQuery.paginate();
    const products = await modifyMongooseQuery.query;

    // Added by APIFeatures class to `this`
    const page = modifyMongooseQuery.page;
    const limit = modifyMongooseQuery.limit;

    res.status(200).json({
        status: response.success,
        data: products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts: totalProducts
    });
});


exports.getProductInfo = catchAsyncError(async (req, res, next) => {
    const pid = req.params.pid;
    const product = await Product.findOne({ _id: pid });

    if (!product) {
        return res.status(404).json({
            status: response.error,
            message: 'Product not found',
        });
    }

    res.status(200).json({
        status: response.success,
        data: product,
    });
});



exports.testController = (req, res, next) => {
    const features = new APIFeatures('query', req.query).filter();
    res.status(200);
    res.end();
}