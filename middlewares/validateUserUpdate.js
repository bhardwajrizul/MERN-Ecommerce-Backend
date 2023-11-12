const { check, validationResult } = require('express-validator');

// Factory function that accepts an array of fields to validate
function validateUserUpdate(allowedUpdateFields) {
    return [
        // Generate validation chains dynamically based on allowed fields
        ...allowedUpdateFields.map(field => {
            switch (field) {
                case 'phoneNumber':
                    return check(field)
                        .optional({ checkFalsy: true })
                        .isMobilePhone()
                        .withMessage('Invalid phone number format.');
                case 'address':
                    return check(field)
                        .optional({ checkFalsy: true })
                        .trim()
                        .isLength({ min: 10 })
                        .withMessage('Address should be at least 10 characters long.');
                case 'name':
                    return check(field)
                        .optional({ checkFalsy: true })
                        .trim()
                        .isLength({ min: 2 })
                        .withMessage('Name must be at least 2 characters long.')
                        .matches(/^[a-zA-Z\s]+$/)
                        .withMessage('Name must only contain letters and spaces.');
                default:
                    return check(field).optional(); // Fallback for fields without specific validation
            }
        }),

        // Middleware to check the validation result and sanitize the update fields
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Filter out the fields that are not in the allowed list or are empty strings
            const updates = allowedUpdateFields.reduce((acc, field) => {
                // Check if the field exists and is not an empty string
                if (req.body.hasOwnProperty(field) && req.body[field] !== '') {
                    acc[field] = req.body[field];
                }
                return acc;
            }, {});

            // Add the filtered updates to the request object for use in the update function
            req.userUpdates = updates;

            next();
        },
    ];
}

module.exports = { validateUserUpdate };
