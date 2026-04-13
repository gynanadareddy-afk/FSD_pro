const express = require('express');
const database = require('./config/database');
const memoryStore = require('./utils/memoryStore');

const app = express();
app.use(express.json());

app.get('/api/test-courses', async (req, res) => {
    try {
        console.log('Test endpoint called');
        
        // Test basic memory store functionality
        await memoryStore.initialize();
        console.log('Memory store initialized');
        
        // Test the exact call that's failing
        const query = { is_active: true };
        console.log('Testing with query:', query);
        
        const courses = await memoryStore.find('courses', query, { 
            sort: 'code', 
            limit: 50, 
            skip: 0 
        });
        
        console.log('SUCCESS: Found', courses.length, 'courses');
        
        res.json({ 
            success: true, 
            data: {
                courses,
                count: courses.length
            }
        });
        
    } catch (error) {
        console.error('ERROR in test endpoint:', error.message);
        console.error('STACK:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Test failed',
            error: error.message 
        });
    }
});

app.get('/api/test-simple', async (req, res) => {
    try {
        console.log('Simple test called');
        res.json({ success: true, message: 'Simple test works' });
    } catch (error) {
        console.error('Simple test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

async function start() {
    await database.connect();
    
    app.listen(5003, () => {
        console.log('Debug server running on port 5003');
        console.log('Test with: curl http://localhost:5003/api/test-courses');
    });
}

start();
