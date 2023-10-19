const {logError} = require('../config')

module.exports = (err, req, res, next) => {
    logError('Server Error', err, err.stack)
    res.status(500).send('Something broke!');
};