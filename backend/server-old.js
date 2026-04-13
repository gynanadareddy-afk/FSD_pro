const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const session = require('express-session');

const database = require('./config/database');
const { seedDatabase } = require('./utils/seedData');
const { validateContactMessage } = require('./middleware/validation');
const { sessionConfig, requireAdminAuth } = require('./middleware/adminAuth');
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
    limits: {
        fileSize: 5 * 1024 * 1024
    },
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

app.get('/api/debug/memorystore', async (req, res) => {
    try {
        console.log('[DEBUG] Checking memoryStore');
        const collections = Object.keys(memoryStore.collections);
        console.log('[DEBUG] Available collections:', collections);
        
        const stats = {};
        for (const collection of collections) {
            const count = await memoryStore.countDocuments(collection);
            stats[collection] = count;
            console.log(`[DEBUG] ${collection}: ${count} items`);
        }
        
        res.json({ success: true, data: { collections, stats } });
    } catch (error) {
        console.error('[DEBUG] Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin routes
app.use('/api/admin', adminRoutes);

// Admin web routes
app.get('/admin/login', (req, res) => {
    res.sendFile('admin-login.html', { root: path.join(__dirname, 'public') });
});

app.get('/admin/dashboard', requireAdminAuth, (req, res) => {
    res.sendFile('admin-dashboard.html', { root: path.join(__dirname, 'public') });
});

app.get('/api/faculty', async (req, res, next) => {
    try {
        const { active = true, limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let faculty, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (active !== 'false') {
                query.is_active = true;
            }
            
            faculty = await Faculty.find(query)
                .sort({ last_name: 1, first_name: 1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await Faculty.countDocuments(query);
        } else {
            const query = {};
            if (active !== 'false') {
                query.is_active = true;
            }
            
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

app.get('/api/faculty/:id', async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }
        res.json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});

app.post('/api/faculty', upload.single('profile_image'), async (req, res, next) => {
    try {
        const facultyData = { ...req.body };
        if (req.file) {
            facultyData.profile_image = `/uploads/faculty/${req.file.filename}`;
        }
        
        const faculty = await Faculty.create(facultyData);
        res.status(201).json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});

app.put('/api/faculty/:id', upload.single('profile_image'), async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.profile_image = `/uploads/faculty/${req.file.filename}`;
        }
        
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }
        
        res.json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});

app.get('/api/news', async (req, res, next) => {
    try {
        const { limit = 10, page = 1, category, featured } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let news, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (category) {
                query.category = category;
            }
            if (featured === 'true') {
                query.is_featured = true;
            }
            
            news = await News.find(query)
                .sort({ publish_date: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await News.countDocuments(query);
        } else {
            const query = {};
            if (category) {
                query.category = category;
            }
            if (featured === 'true') {
                query.is_featured = true;
            }
            
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

app.get('/api/news/:id', async (req, res, next) => {
    try {
        let news;
        if (database.isPersistent()) {
            news = await News.findById(req.params.id);
        } else {
            news = await memoryStore.findById('news', req.params.id);
        }
        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }
        res.json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
});

app.post('/api/news', async (req, res, next) => {
    try {
        let news;
        if (database.isPersistent()) {
            news = await News.create(req.body);
        } else {
            news = await memoryStore.create('news', req.body);
        }
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
});

app.get('/api/events', async (req, res, next) => {
    try {
        const { limit = 10, page = 1, type, status = 'upcoming' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let events, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (type) {
                query.type = type;
            }
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
            if (type) {
                query.type = type;
            }
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

app.get('/api/events/:id', async (req, res, next) => {
    try {
        let event;
        if (database.isPersistent()) {
            event = await Event.findById(req.params.id);
        } else {
            event = await memoryStore.findById('events', req.params.id);
        }
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
});

app.post('/api/events', async (req, res, next) => {
    try {
        let event;
        if (database.isPersistent()) {
            event = await Event.create(req.body);
        } else {
            event = await memoryStore.create('events', req.body);
        }
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
});

app.get('/api/courses', async (req, res, next) => {
    try {
        const { limit = 50, page = 1, semester, faculty, active = true } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let courses, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (semester) query.semester = semester;
            if (faculty) query.faculty = new RegExp(faculty, 'i');
            if (active !== 'false') query.is_active = true;
            
            courses = await Course.find(query).sort({ code: 1 }).limit(parseInt(limit)).skip(skip).lean();
            total = await Course.countDocuments(query);
        } else {
            const query = {};
            if (semester) query.semester = semester;
            if (faculty) query.faculty = faculty;
            if (active !== 'false') query.is_active = true;
            
            courses = await memoryStore.find('courses', query, { 
                sort: 'code', 
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('courses', query);
        }
        
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
        next(error);
    }
});

app.get('/api/courses/:id', async (req, res, next) => {
    try {
        let course;
        if (database.isPersistent()) {
            course = await Course.findById(req.params.id);
        } else {
            course = await memoryStore.findById('courses', req.params.id);
        }
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
});

app.post('/api/courses', async (req, res, next) => {
    try {
        let course;
        if (database.isPersistent()) {
            course = await Course.create(req.body);
        } else {
            course = await memoryStore.create('courses', req.body);
        }
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
});

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

app.get('/api/contact', async (req, res, next) => {
    try {
        const { limit = 20, page = 1, status, message_type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const query = {};
        if (status) {
            query.status = status;
        }
        if (message_type) {
            query.message_type = message_type;
        }
        
        const messages = await ContactMessage.find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();
            
        const total = await ContactMessage.countDocuments(query);
        
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

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

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

let httpServer;

async function stopServer() {
    if (httpServer) {
        await new Promise((resolve, reject) => {
            httpServer.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    
    await database.disconnect();
}

async function startServer() {
    try {
        const connected = await database.connect();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }
        
        if (database.isPersistent()) {
            await seedDatabase();
        } else {
            await memoryStore.initialize();
        }
        
        httpServer = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Database: ${database.getConnectionState()}`);
            console.log(`Open http://localhost:${PORT} to view website`);
            console.log(`API available at http://localhost:${PORT}/api`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        await stopServer();
        process.exit(0);
    });
});

startServer();
