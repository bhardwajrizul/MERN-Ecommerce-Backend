
const isProduction = process.env.NODE_ENV === 'production';

function logError(message, err, stack) {
    if (!isProduction) {
        console.error(message);
        if (err) {
            console.error(err.name);
            console.error(err);
        }
        if (stack) {
            console.error(stack);
        }
    } else {
        console.error(GENERIC_ERROR);
    }
}

module.exports = {
    isProduction,
    GENERIC_ERROR:'An error occurred! Please try again later.',
    logError,
    response: {
        success: 'success',
        error: 'error'
    }
};
