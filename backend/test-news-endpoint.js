const express = require('express');
const database = require('./config/database');
const memoryStore = require('./utils/memoryStore');

const app = express();
app.use(express.json());

app.get('/api/news', async (req, res, next) => {
    try {
        console.log('News endpoint called');
        const { limit = 10, page = 1, category, featured } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        console.log('Query params:', { limit, page, category, featured });
        
        let news, total;
        
        if (database.isPersistent()) {
            console.log('Using persistent database');
            const query = {};
            if (category) query.category = category;
            if (featured === 'true') query.is_featured = true;
            
            news = []; // Mock for now
            total = 0;
        } else {
            console.log('Using memory store');
            const query = {};
            if (category) query.category = category;
            if (featured === 'true') query.is_featured = true;
            
            console.log('Calling memoryStore.find...');
            news = await memoryStore.find('news', query, { 
                sort: 'publish_date', 
                order: 'desc',
                limit: parseInt(limit), 
                skip 
            });
            total = await memoryStore.countDocuments('news', query);
        }
        
        console.log('Results:', { newsLength: news.length, total });
        
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

async function start() {
    await database.connect();
    if (!database.isPersistent()) {
        await memoryStore.initialize();
    }
    
    app.listen(5001, () => {
        console.log('Test server running on port 5001');
        console.log('Test with: curl http://localhost:5001/api/news');
    });
}

start();
