const mongoose = require('mongoose')
const validCombinations = {
    Electronics: ['Smartphones', 'Laptops', 'Headphones', 'Cameras', 'Wearable Tech', 'Other'],
    Fashion: ['Apparel', 'Bags', 'Watches', 'Glasses', 'Top', 'Bottom', 'Outerwear', 'Footwear', 'Other'],
    'Home & Living': ['Furniture', 'Home Decor', 'Kitchenware', 'Bedding', 'Lighting', 'Other'],
    'Beauty & Health': ['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Wellness Products', 'Other'],
    'Books & Stationery': ['Novels', 'Notebooks', 'Pens', 'Academic Books', 'Art Supplies', 'Other'],
    Other: ['Other']
};


function isValidCategorySubcategoryCombination(value) {
    if (!validCombinations[value.name]) {
        return false;
    }
    // Check if every subcategory is valid for the given category

    return value.subcategories.every(sub => validCombinations[value.name].includes(sub));
}

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Electronics', 'Fashion', 'Home & Living', 'Beauty & Health', 'Books & Stationery', 'Other'],
        required: true
    },
    subcategories: [{
        type: String,
        validate: {
            validator: function(sub) {
                // Validate individual subcategory
                return validCombinations[this.name] && validCombinations[this.name].includes(sub);
            },
            message: props => `Subcategory "${props.value}" is not valid for category "${this.name}"!`
        }
    }],
});

categorySchema.pre('validate', function(next) {
    if (!isValidCategorySubcategoryCombination(this)) {
        // If the validation fails, introduce a new error
        this.invalidate('categories', 'Invalid combination of category and subcategories!');
    }
    next(); // Continue with the rest of the validation process
});


module.exports = {
    categorySchema,
    validCombinations,
    isValidCategorySubcategoryCombination
};