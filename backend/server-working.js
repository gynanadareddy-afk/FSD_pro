const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const database = require('./config/database');
const memoryStore = require('./utils/memoryStore');
const Faculty = require('./models/Faculty');
const News = require('./models/News');
const Event = require('./models/Event');
const Course = require('./models/Course');
const ContactMessage = require('./models/ContactMessage');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendRoot = path.join(__dirname, '../frontend');

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(express.static(frontendRoot));

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
            
            courses = await Course.find(query)
                .sort({ code: 1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
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

app.get('/api/contact', async (req, res, next) => {
    try {
        const { limit = 20, page = 1, status, message_type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let messages, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (status) query.status = status;
            if (message_type) query.message_type = message_type;
            
            messages = await ContactMessage.find(query)
                .sort({ created_at: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean();
                
            total = await ContactMessage.countDocuments(query);
        } else {
            const query = {};
            if (status) query.status = status;
            if (message_type) query.message_type = message_type;
            
            messages = await memoryStore.find('contactmessages', query, { 
                sort: 'createdAt', 
                order: 'desc',
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('contactmessages', query);
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

// Error handling
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    console.error('Stack:', error.stack);
    
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
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
