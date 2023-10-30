const express = require('express');
const productRouter = require('./routes/productRoutes')
const userRouter = require('./routes/userRouter')
const globalErrorHandler = require('./controllers/errorController')
require('./initFirebase').initFirebase();

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE'
    );
    next();
})
// Middleware
app.use(express.json({limit: '10kb'})); // for parsing application/json 
app.use((req, res, next) => {
    console.log(req.url);
    next();
})


// Routes
app.get('/', (req, res) => {
    const time = new Date()
    res.end('API Running...');
});
app.use('/api/products', productRouter)
app.use('/api/users', userRouter)



// Generic Error Handler 
app.use(globalErrorHandler);

module.exports = app;