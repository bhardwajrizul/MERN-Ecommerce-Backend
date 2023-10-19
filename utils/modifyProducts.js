const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Product = require('../models/productModel'); 
const { validCombinations } = require('../models/schemas/categorySchema')
const connectDB = require('../db')



async function seedProducts(qty) {
    await connectDB();

    const products = [];
    const quantity = qty; 

    for (let i = 0; i < quantity; i++) {
        const selectedMainCategory = faker.helpers.arrayElement(Object.keys(validCombinations));
        const selectedSubcategory = faker.helpers.arrayElement(validCombinations[selectedMainCategory]);

        products.push({
            image: faker.image.url({width:250, height:250}),
            name: faker.commerce.productName(),
            price: parseFloat(faker.commerce.price()),
            discountPercent: faker.number.int({max: 50, min: 1}),
            description: faker.lorem.sentence(),
            categories: [{
                name: selectedMainCategory,
                subcategories: [selectedSubcategory]
            }],
            rating: faker.number.float({ min: 0, max: 5, precision: 0.1 }), // A rating between 0 to 5 with one decimal place precision
            ratingCount: faker.number.int({ min: 1, max: 500 }), // A random number of people who rated the product
            gender: faker.helpers.arrayElement(['male', 'female', 'unisex']),
            brand: faker.company.name()
        });
    }

    try {
        await Product.insertMany(products);
        console.log(`Successfully saved ${quantity} products to the database.`);
    } catch (error) {
        console.error(`Failed to save products. Error: ${error.message}`);
    }

    // Close the database connection
    await mongoose.connection.close();
}


async function deleteProducts() {
    await connectDB();

    try {
        await Product.deleteMany();
        console.log(`Successfully deleted products from the database.`);
    } catch (error) {
        console.error(`Failed to save products. Error: ${error.message}`);
    }
    // Close the database connection
    await mongoose.connection.close();

}


function getArguments(argv) {
    return argv.slice(2).reduce((args, arg) => {
        let [key, value] = arg.split('=');
        args[key.replace('--', '')] = value || true;
        return args;
    }, {});
}


function main() {
    const args = getArguments(process.argv);
    if (args.deleteAll) {
        deleteProducts().catch((err) => {
            console.error(err);
            process.exit(1);
        })
    }
    if (args.seed) {
        let qty = 0; 
        if (args.seed === true) {
            console.error('Specify amount of products to seed');
            return;
        } else {
            qty = args.seed;
            seedProducts(qty).catch(err => {
                console.error(err);
                process.exit(1);
            });
        }
    }
    

}

/*  
DELETE ALL PRODUCTS 
npm run modifyProducts -- --deleteAll
*/

/* 
SEED PRODUCTS 
npm run modifyProducts -- --seed=10
*/
main()