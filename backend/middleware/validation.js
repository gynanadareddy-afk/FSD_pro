const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const validateContactMessage = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
    body('subject')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Subject must not exceed 200 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Please provide a valid phone number'),
    body('message_type')
        .optional()
        .isIn(['general', 'admission', 'research', 'complaint', 'other'])
        .withMessage('Invalid message type'),
    handleValidationErrors
];

const validateFaculty = [
    body('first_name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('last_name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('designation')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Bio must not exceed 1000 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

const validateNews = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Content must be between 10 and 5000 characters'),
    body('author')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Author must be between 2 and 100 characters'),
    body('category')
        .isIn(['Achievements', 'Infrastructure', 'Recruitment', 'Announcement', 'General'])
        .withMessage('Invalid category'),
    body('publish_date')
        .isISO8601()
        .withMessage('Please provide a valid publish date'),
    handleValidationErrors
];

const validateEvent = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('start_date')
        .isISO8601()
        .withMessage('Please provide a valid start date'),
    body('end_date')
        .isISO8601()
        .withMessage('Please provide a valid end date'),
    body('venue')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Venue must be between 2 and 100 characters'),
    body('speaker')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Speaker must be between 2 and 100 characters'),
    body('type')
        .isIn(['Workshop', 'Seminar', 'Competition', 'Guest Lecture', 'Conference', 'Other'])
        .withMessage('Invalid event type'),
    handleValidationErrors
];

const validateCourse = [
    body('name')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Course name must be between 5 and 100 characters'),
    body('code')
        .matches(/^[A-Z]{2,4}\d{3,4}$/)
        .withMessage('Course code must be in format like CS201'),
    body('credits')
        .isInt({ min: 1, max: 10 })
        .withMessage('Credits must be between 1 and 10'),
    body('semester')
        .isIn(['Fall', 'Spring', 'Summer'])
        .withMessage('Invalid semester'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('faculty')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Faculty name must be between 2 and 100 characters'),
    handleValidationErrors
];

module.exports = {
    validateContactMessage,
    validateFaculty,
    validateNews,
    validateEvent,
    validateCourse,
    handleValidationErrors
};
