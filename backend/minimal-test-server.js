const express = require('express');
const database = require('./config/database');
const memoryStore = require('./utils/memoryStore');

const app = express();
app.use(express.json());

app.get('/api/courses', async (req, res) => {
    try {
        console.log('Courses endpoint called');
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const query = { is_active: true };
        
        console.log('Calling memoryStore.find...');
        const courses = await memoryStore.find('courses', query, { 
            sort: 'code', 
            limit: parseInt(limit), 
            skip 
        });
        console.log('Got courses:', courses.length);
        
        const total = await memoryStore.countDocuments('courses', query);
        
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
        console.error('Error in courses endpoint:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
});

app.get('/api/news', async (req, res) => {
    try {
        console.log('News endpoint called');
        const { limit = 10, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const query = {};
        
        console.log('Calling memoryStore.find for news...');
        const news = await memoryStore.find('news', query, { 
            sort: 'publish_date', 
            order: 'desc',
            limit: parseInt(limit), 
            skip 
        });
        console.log('Got news:', news.length);
        
        const total = await memoryStore.countDocuments('news', query);
        
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
        console.error('Error in news endpoint:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        console.log('Events endpoint called');
        const { limit = 10, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const query = {};
        
        console.log('Calling memoryStore.find for events...');
        const events = await memoryStore.find('events', query, { 
            sort: 'start_date', 
            limit: parseInt(limit), 
            skip 
        });
        console.log('Got events:', events.length);
        
        const total = await memoryStore.countDocuments('events', query);
        
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
        console.error('Error in events endpoint:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
});

async function start() {
    await database.connect();
    if (!database.isPersistent()) {
        await memoryStore.initialize();
    }
    
    app.listen(5002, () => {
        console.log('Minimal test server running on port 5002');
        console.log('Test with: curl http://localhost:5002/api/courses');
    });
}

start();
