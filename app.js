require('./initFirebase').initFirebase();
const express = require('express');
const productRouter = require('./routes/productRoutes')
const userRouter = require('./routes/userRouter')
const orderRouter = require('./routes/orderRoutes');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('./utils/rateLimit')

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
app.use(express.json({ limit: '10kb' })); // for parsing application/json 
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(req.url, req.method);
    next();
})

app.use(rateLimit(300, 3600000)); // 300 request from an IP every hour

// Routes
app.get('/', (req, res) => {
    const time = new Date()
    res.end('API Running...');
});
app.use('/api/products', productRouter)
app.use('/api/users', userRouter)
app.use('/api/order', orderRouter)



// Generic Error Handler 
app.use(globalErrorHandler);

module.exports = app;