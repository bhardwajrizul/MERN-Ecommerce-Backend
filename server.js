require('dotenv').config(); 
const mongoose = require('mongoose')
const app = require('./app')
const connectDB = require('./db');
const {isProduction, GENERIC_ERROR, logError} = require('./config');

console.log(process.env.NODE_ENV)

// Handle uncaught exception
process.on('uncaughtException', err => {
    logError('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
});

// Connect to the database
connectDB();


// Start Server
const port = 8080
const server = app.listen(process.env.PORT || port, (err) => {
    err ? isProduction ? console.error(GENERIC_ERROR) : console.error(err)   
        : console.log(`Server Started at port ${port}`)
})

// Handle unhandeled rejects
process.on('unhandledRejection', err => {
    logError('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
  });

  // Listen for SIGTERM signal - e.g. Docker stop
process.on('SIGTERM', () => {
    !isProduction 
        ? console.error('🛑 SIGTERM RECEIVED. Shutting down gracefully.')
        : console.error(GENERIC_ERROR)
    shutdown();
});

// Listen for SIGINT signal - e.g. Ctrl+C
process.on('SIGINT', () => {
    !isProduction 
        ? console.error('🛑 SIGINT RECEIVED. Shutting down gracefully.')
        : console.error(GENERIC_ERROR);
    shutdown();
});

function shutdown() {
    server.close(() => {
        console.error('🛑 Process terminated!');
        mongoose.connection.close()
        process.exit(1);  
    });
}