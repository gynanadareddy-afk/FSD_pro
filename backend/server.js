const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs').promises;

const database = require('./config/database');
const { sessionConfig, requireAdminAuth } = require('./middleware/adminAuth');
const { validateContactMessage } = require('./middleware/validation');
const memoryStore = require('./utils/memoryStore');

const Faculty = require('./models/Faculty');
const News = require('./models/News');
const Event = require('./models/Event');
const Course = require('./models/Course');
const ContactMessage = require('./models/ContactMessage');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendRoot = path.join(__dirname, '../frontend');
const uploadsDir = path.join(__dirname, 'uploads');
const facultyImagesDir = path.join(uploadsDir, 'faculty');

// Multer configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(facultyImagesDir, { recursive: true });
            cb(null, facultyImagesDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `faculty-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
        }
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(session(sessionConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(frontendRoot));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: frontendRoot });
});

app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await database.healthCheck();
        res.json({ 
            success: true, 
            data: { 
                status: 'ok',
                database: dbHealth,
                timestamp: new Date().toISOString()
            } 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Health check failed',
            error: error.message 
        });
    }
});

// Admin routes
app.use('/api/admin', adminRoutes);

// Admin web routes
app.get('/admin/login', (req, res) => {
    res.sendFile('admin-login.html', { root: path.join(__dirname, 'public') });
});

app.get('/admin/profile', requireAdminAuth, (req, res) => {
    res.sendFile('admin-profile.html', { root: path.join(__dirname, 'public') });
});

app.get('/admin/dashboard', requireAdminAuth, (req, res) => {
    res.sendFile('admin-dashboard.html', { root: path.join(__dirname, 'public') });
});

// Faculty endpoints
app.get('/api/faculty', async (req, res, next) => {
    try {
        const { active = true, limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let faculty, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (active !== 'false') query.is_active = true;
            
            faculty = await Faculty.find(query)
                .sort({ last_name: 1, first_name: 1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await Faculty.countDocuments(query);
        } else {
            const query = {};
            if (active !== 'false') query.is_active = true;
            
            faculty = await memoryStore.find('faculty', query, { 
                sort: 'last_name', 
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('faculty', query);
        }
        
        res.json({ 
            success: true, 
            data: {
                faculty,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// News endpoints
app.get('/api/news', async (req, res, next) => {
    try {
        const { limit = 10, page = 1, category, featured } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let news, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (category) query.category = category;
            if (featured === 'true') query.is_featured = true;
            
            news = await News.find(query)
                .sort({ publish_date: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await News.countDocuments(query);
        } else {
            const query = {};
            if (category) query.category = category;
            if (featured === 'true') query.is_featured = true;
            
            news = await memoryStore.find('news', query, { 
                sort: 'publish_date', 
                order: 'desc',
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('news', query);
        }
        
        res.json({ 
            success: true, 
            data: {
                news,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Events endpoints
app.get('/api/events', async (req, res, next) => {
    try {
        const { limit = 10, page = 1, type, status = 'upcoming' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let events, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (type) query.type = type;
            if (status === 'upcoming') {
                query.start_date = { $gte: new Date() };
            } else if (status === 'past') {
                query.end_date = { $lt: new Date() };
            } else {
                query.status = status;
            }
            
            events = await Event.find(query)
                .sort({ start_date: 1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await Event.countDocuments(query);
        } else {
            const query = {};
            if (type) query.type = type;
            if (status === 'upcoming') {
                query.start_date = new Date();
            } else if (status === 'past') {
                query.end_date = new Date();
            } else {
                query.status = status;
            }
            
            events = await memoryStore.find('events', query, { 
                sort: 'start_date', 
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('events', query);
        }
        
        res.json({ 
            success: true, 
            data: {
                events,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Courses endpoint - FIXED VERSION
app.get('/api/courses', async (req, res, next) => {
    try {
        console.log('[COURSES] Request received');
        const { limit = 50, page = 1, semester, faculty, active = true } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        console.log('[COURSES] Query params:', { limit, page, semester, faculty, active, skip });
        
        let courses, total;
        
        if (database.isPersistent()) {
            console.log('[COURSES] Using persistent database');
            const query = {};
            if (semester) query.semester = semester;
            if (faculty) query.faculty = new RegExp(faculty, 'i');
            if (active !== 'false') query.is_active = true;
            
            courses = await Course.find(query)
                .sort({ code: 1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await Course.countDocuments(query);
        } else {
            console.log('[COURSES] Using memory store');
            const query = {};
            if (semester) query.semester = semester;
            if (faculty) query.faculty = faculty;
            if (active !== 'false') query.is_active = true;
            
            console.log('[COURSES] Memory store query:', query);
            
            // Direct call to memory store
            try {
                courses = await memoryStore.find('courses', query, { 
                    sort: 'code', 
                    limit: parseInt(limit), 
                    skip 
                });
                console.log('[COURSES] Memory store result:', courses ? courses.length : 'null');
                
                total = await memoryStore.countDocuments('courses', query);
                console.log('[COURSES] Count result:', total);
            } catch (memError) {
                console.error('[COURSES] Memory store error:', memError);
                throw memError;
            }
        }
        
        console.log('[COURSES] Preparing response');
        res.json({ 
            success: true, 
            data: {
                courses,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('[COURSES] Error:', error.message);
        console.error('[COURSES] Stack:', error.stack);
        next(error);
    }
});

// Contact endpoint
app.post('/api/contact', validateContactMessage, async (req, res, next) => {
    try {
        let contactMessage;
        
        if (database.isPersistent()) {
            contactMessage = await ContactMessage.create(req.body);
        } else {
            contactMessage = await memoryStore.create('contactmessages', req.body);
        }
        
        res.status(201).json({ 
            success: true, 
            message_id: contactMessage._id,
            message: 'Contact message submitted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Get contact messages (Admin only)
app.get('/api/contact', async (req, res, next) => {
    try {
        let messages, total;
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        if (database.isPersistent()) {
            messages = await ContactMessage.find({})
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await ContactMessage.countDocuments({});
        } else {
            messages = await memoryStore.find('contactmessages', {}, { 
                sort: 'createdAt',
                order: 'desc',
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('contactmessages', {});
        }
        
        res.json({ 
            success: true, 
            data: {
                messages,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete contact message endpoint
app.delete('/api/contact/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let deleted = false;
        
        if (database.isPersistent()) {
            const result = await ContactMessage.findByIdAndDelete(id);
            deleted = !!result;
        } else {
            deleted = await memoryStore.deleteById('contactmessages', id);
        }
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Delete faculty endpoint
app.delete('/api/faculty/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let deleted = false;
        
        if (database.isPersistent()) {
            const result = await Faculty.findByIdAndDelete(id);
            deleted = !!result;
        } else {
            deleted = await memoryStore.deleteById('faculty', id);
        }
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Faculty member not found' });
        }
        
        res.json({ success: true, message: 'Faculty member deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Get faculty by ID endpoint
app.get('/api/faculty/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let faculty;
        
        if (database.isPersistent()) {
            faculty = await Faculty.findById(id);
        } else {
            faculty = await memoryStore.findById('faculty', id);
        }
        
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty member not found' });
        }
        
        res.json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});

// Update faculty endpoint
app.put('/api/faculty/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let faculty;
        
        if (database.isPersistent()) {
            faculty = await Faculty.findByIdAndUpdate(id, req.body, { new: true });
        } else {
            faculty = await memoryStore.updateById('faculty', id, req.body);
        }
        
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty member not found' });
        }
        
        res.json({ success: true, data: faculty, message: 'Faculty member updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Add new faculty endpoint
app.post('/api/faculty', async (req, res, next) => {
    try {
        const data = { ...req.body, is_active: true };
        let faculty;
        
        if (database.isPersistent()) {
            faculty = await Faculty.create(data);
        } else {
            faculty = await memoryStore.create('faculty', data);
        }
        
        res.status(201).json({ success: true, data: faculty, message: 'Faculty member added successfully' });
    } catch (error) {
        next(error);
    }
});

// News CRUD endpoints
app.post('/api/news', async (req, res, next) => {
    try {
        let news;
        
        if (database.isPersistent()) {
            news = await News.create(req.body);
        } else {
            news = await memoryStore.create('news', { ...req.body, publish_date: new Date() });
        }
        
        res.status(201).json({ success: true, data: news, message: 'News article added successfully' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/news/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let news;
        
        if (database.isPersistent()) {
            news = await News.findById(id);
        } else {
            news = await memoryStore.findById('news', id);
        }
        
        if (!news) {
            return res.status(404).json({ success: false, message: 'News article not found' });
        }
        
        res.json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
});

app.put('/api/news/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let news;
        
        if (database.isPersistent()) {
            news = await News.findByIdAndUpdate(id, req.body, { new: true });
        } else {
            news = await memoryStore.updateById('news', id, req.body);
        }
        
        if (!news) {
            return res.status(404).json({ success: false, message: 'News article not found' });
        }
        
        res.json({ success: true, data: news, message: 'News article updated successfully' });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/news/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let deleted = false;
        
        if (database.isPersistent()) {
            const result = await News.findByIdAndDelete(id);
            deleted = !!result;
        } else {
            deleted = await memoryStore.deleteById('news', id);
        }
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'News article not found' });
        }
        
        res.json({ success: true, message: 'News article deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Events CRUD endpoints
app.post('/api/events', async (req, res, next) => {
    try {
        let event;

        // Normalize dates so both persistent DB and memory store behave the same.
        const payload = { ...req.body };
        if (payload.start_date) {
            const d = new Date(payload.start_date);
            if (Number.isNaN(d.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid start_date' });
            }
            payload.start_date = d;
        }
        if (payload.end_date) {
            const d = new Date(payload.end_date);
            if (Number.isNaN(d.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid end_date' });
            }
            payload.end_date = d;
        }
        
        if (database.isPersistent()) {
            event = await Event.create(payload);
        } else {
            // Don't overwrite user-provided dates in memory mode.
            event = await memoryStore.create('events', payload);
        }
        
        res.status(201).json({ success: true, data: event, message: 'Event added successfully' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let event;
        
        if (database.isPersistent()) {
            event = await Event.findById(id);
        } else {
            event = await memoryStore.findById('events', id);
        }
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
});

app.put('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let event;
        
        if (database.isPersistent()) {
            event = await Event.findByIdAndUpdate(id, req.body, { new: true });
        } else {
            event = await memoryStore.updateById('events', id, req.body);
        }
        
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        res.json({ success: true, data: event, message: 'Event updated successfully' });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let deleted = false;
        
        if (database.isPersistent()) {
            const result = await Event.findByIdAndDelete(id);
            deleted = !!result;
        } else {
            deleted = await memoryStore.deleteById('events', id);
        }
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Courses CRUD endpoints
app.post('/api/courses', async (req, res, next) => {
    try {
        const data = { ...req.body, is_active: true };
        let course;
        
        if (database.isPersistent()) {
            course = await Course.create(data);
        } else {
            course = await memoryStore.create('courses', data);
        }
        
        res.status(201).json({ success: true, data: course, message: 'Course added successfully' });
    } catch (error) {
        next(error);
    }
});

app.get('/api/courses/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let course;
        
        if (database.isPersistent()) {
            course = await Course.findById(id);
        } else {
            course = await memoryStore.findById('courses', id);
        }
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        res.json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
});

app.put('/api/courses/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let course;
        
        if (database.isPersistent()) {
            course = await Course.findByIdAndUpdate(id, req.body, { new: true });
        } else {
            course = await memoryStore.updateById('courses', id, req.body);
        }
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        res.json({ success: true, data: course, message: 'Course updated successfully' });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/courses/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        let deleted = false;
        
        if (database.isPersistent()) {
            const result = await Course.findByIdAndDelete(id);
            deleted = !!result;
        } else {
            deleted = await memoryStore.deleteById('courses', id);
        }
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('='.repeat(50));
    console.error('Server Error:', error.message);
    console.error('Error Type:', error.name);
    console.error('Stack:', error.stack);
    console.error('Request URL:', req.url);
    console.error('Request Method:', req.method);
    console.error('='.repeat(50));
    
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({ 
            success: false, 
            message: `${field} already exists` 
        });
    }
    
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors 
        });
    }
    
    if (error instanceof multer.MulterError) {
        let message = 'File upload error';
        if (error.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large (max 5MB)';
        }
        return res.status(400).json({ 
            success: false, 
            message 
        });
    }
    
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Start server
async function startServer() {
    try {
        const connected = await database.connect();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }
        
        if (database.isPersistent()) {
            console.log('Using persistent MongoDB');
        } else {
            await memoryStore.initialize();
            console.log('Using in-memory data simulation');
        }
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Database: ${database.getConnectionState()}`);
            console.log(`Open http://localhost:${PORT} to view website`);
            console.log(`API available at http://localhost:${PORT}/api`);
            console.log(`Admin login: http://localhost:${PORT}/admin/login`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
