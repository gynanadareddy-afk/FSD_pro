const express = require('express');
const { ADMIN_CREDENTIALS, requireAuth, requireAdminAuth, requireSuperAdminAuth } = require('../middleware/adminAuth');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const memoryStore = require('../utils/memoryStore');
const router = express.Router();

function toLowerTrim(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function stripPassword(admin) {
    if (!admin) return admin;
    const { password, ...rest } = admin;
    return rest;
}

// Admin signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name } = req.body;

        // Validation
        if (!username || !email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const normalizedUsername = toLowerTrim(username);
        const normalizedEmail = toLowerTrim(email);

        let admin;
        if (database.isPersistent()) {
            // Check if admin already exists
            admin = await Admin.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
            if (admin) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Create new admin
            admin = new Admin({
                username: normalizedUsername,
                email: normalizedEmail,
                password,
                first_name,
                last_name
            });

            await admin.save();
        } else {
            const admins = memoryStore.getCollection('admins');
            const exists = admins.some(a => a.username === normalizedUsername || a.email === normalizedEmail);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            admin = {
                _id: memoryStore.generateId(),
                username: normalizedUsername,
                email: normalizedEmail,
                password: await bcrypt.hash(password, 10),
                first_name,
                last_name,
                phone: '',
                department: 'Computer Science',
                role: 'admin',
                is_active: true,
                is_super_admin: false,
                last_login: null,
                login_count: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            admins.push(admin);
        }

        // Set session
        req.session.isAuthenticated = true;
        req.session.adminId = admin._id;
        req.session.username = admin.username;
        req.session.email = admin.email;
        req.session.first_name = admin.first_name;
        req.session.is_super_admin = admin.is_super_admin;

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            data: {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                first_name: admin.first_name,
                last_name: admin.last_name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating admin account',
            error: error.message
        });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const normalized = toLowerTrim(username);

        // Try to find admin by username or email
        let admin;
        if (database.isPersistent()) {
            admin = await Admin.findOne({
                $or: [{ username: normalized }, { email: normalized }]
            }).select('+password');
        } else {
            admin = memoryStore.getCollection('admins').find(a => a.username === normalized || a.email === normalized) || null;
        }

        if (!admin) {
            // Fallback to legacy credentials for backward compatibility
            if (normalized === toLowerTrim(ADMIN_CREDENTIALS.username) && password === ADMIN_CREDENTIALS.password) {
                // If we have a real admin record (DB or memory), attach it to the session
                let legacyAdmin = null;
                if (database.isPersistent()) {
                    legacyAdmin = await Admin.findOne({ username: normalized });
                } else {
                    legacyAdmin = memoryStore.getCollection('admins').find(a => a.username === normalized) || null;
                }

                req.session.isAuthenticated = true;
                req.session.adminId = legacyAdmin ? legacyAdmin._id : undefined;
                req.session.username = normalized;
                req.session.email = legacyAdmin?.email || 'admin@cse.edu';
                req.session.first_name = legacyAdmin?.first_name || 'Admin';
                req.session.is_super_admin = legacyAdmin?.is_super_admin ?? true;

                return res.json({
                    success: true,
                    message: 'Login successful'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check if admin is active
        if (!admin.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is disabled'
            });
        }

        // Compare password
        const isPasswordCorrect = database.isPersistent()
            ? await admin.comparePassword(password)
            : await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Update login info
        admin.last_login = new Date();
        admin.login_count = (admin.login_count || 0) + 1;
        if (database.isPersistent()) {
            await admin.save();
        } else {
            admin.updatedAt = new Date();
        }

        // Set session
        req.session.isAuthenticated = true;
        req.session.adminId = admin._id;
        req.session.username = admin.username;
        req.session.email = admin.email;
        req.session.first_name = admin.first_name;
        req.session.is_super_admin = admin.is_super_admin;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                first_name: admin.first_name,
                last_name: admin.last_name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Check authentication status
router.get('/check-auth', requireAuth, (req, res) => {
    res.json({
        success: true,
        authenticated: true,
        username: req.session.username,
        email: req.session.email,
        first_name: req.session.first_name,
        is_super_admin: req.session.is_super_admin
    });
});

// Get admin profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        let admin;
        if (database.isPersistent()) {
            admin = await Admin.findById(req.session.adminId);
        } else {
            admin = memoryStore.getCollection('admins').find(a => a._id === req.session.adminId) || null;
        }
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                first_name: admin.first_name,
                last_name: admin.last_name,
                phone: admin.phone,
                department: admin.department,
                role: admin.role,
                last_login: admin.last_login,
                login_count: admin.login_count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
});

// Update admin profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { first_name, last_name, phone, department } = req.body;

        let admin;
        if (database.isPersistent()) {
            admin = await Admin.findById(req.session.adminId);
        } else {
            admin = memoryStore.getCollection('admins').find(a => a._id === req.session.adminId) || null;
        }
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update allowed fields
        if (first_name) admin.first_name = first_name;
        if (last_name) admin.last_name = last_name;
        if (phone) admin.phone = phone;
        if (department) admin.department = department;

        if (database.isPersistent()) {
            await admin.save();
        } else {
            admin.updatedAt = new Date();
        }

        // Update session
        req.session.first_name = admin.first_name;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                first_name: admin.first_name,
                last_name: admin.last_name,
                phone: admin.phone,
                department: admin.department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;

        // Validation
        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        let admin;
        if (database.isPersistent()) {
            admin = await Admin.findById(req.session.adminId).select('+password');
        } else {
            admin = memoryStore.getCollection('admins').find(a => a._id === req.session.adminId) || null;
        }
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isPasswordCorrect = database.isPersistent()
            ? await admin.comparePassword(current_password)
            : await bcrypt.compare(current_password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        if (database.isPersistent()) {
            admin.password = new_password;
            await admin.save();
        } else {
            admin.password = await bcrypt.hash(new_password, 10);
            admin.updatedAt = new Date();
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
});

// Get all admins (super admin only)
router.get('/all', requireSuperAdminAuth, async (req, res) => {
    try {
        let admins;
        if (database.isPersistent()) {
            admins = await Admin.find().select('-password');
        } else {
            admins = memoryStore.getCollection('admins').map(stripPassword);
        }
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admins',
            error: error.message
        });
    }
});

// Get admin statistics
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const database = require('../config/database');
        const memoryStore = require('../utils/memoryStore');

        let stats = {};

        if (database.isPersistent()) {
            const Faculty = require('../models/Faculty');
            const News = require('../models/News');
            const Event = require('../models/Event');
            const Course = require('../models/Course');
            const ContactMessage = require('../models/ContactMessage');

            const [facultyCount, newsCount, eventsCount, coursesCount, messagesCount] = await Promise.all([
                Faculty.countDocuments({ is_active: true }),
                News.countDocuments({}),
                Event.countDocuments({}),
                Course.countDocuments({ is_active: true }),
                ContactMessage.countDocuments({})
            ]);

            stats = {
                faculty: facultyCount,
                news: newsCount,
                events: eventsCount,
                courses: coursesCount,
                messages: messagesCount
            };
        } else {
            const [facultyCount, newsCount, eventsCount, coursesCount, messagesCount] = await Promise.all([
                memoryStore.countDocuments('faculty', { is_active: true }),
                memoryStore.countDocuments('news', {}),
                memoryStore.countDocuments('events', {}),
                memoryStore.countDocuments('courses', { is_active: true }),
                memoryStore.countDocuments('contactmessages', {})
            ]);

            stats = {
                faculty: facultyCount,
                news: newsCount,
                events: eventsCount,
                courses: coursesCount,
                messages: messagesCount
            };
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

module.exports = router;
