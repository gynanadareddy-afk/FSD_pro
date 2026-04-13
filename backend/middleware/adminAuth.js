const session = require('express-session');

// Legacy admin credentials (kept for backward compatibility)
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'cseadmin123'
};

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'cse-department-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        redirectTo: '/admin/login'
    });
};

// Middleware to check if user is admin (for web routes)
const requireAdminAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/admin/login');
};

// Middleware to check if user is super admin
const requireSuperAdminAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated && req.session.is_super_admin) {
        return next();
    }
    res.status(403).json({ 
        success: false, 
        message: 'Super admin access required'
    });
};

module.exports = {
    ADMIN_CREDENTIALS,
    sessionConfig,
    requireAuth,
    requireAdminAuth,
    requireSuperAdminAuth
};
