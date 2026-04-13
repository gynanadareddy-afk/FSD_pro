const database = require('./config/database');
const memoryStore = require('./utils/memoryStore');

async function testServerCalls() {
    try {
        await database.connect();
        if (!database.isPersistent()) {
            await memoryStore.initialize();
        }
        
        console.log('Testing courses endpoint logic...');
        const { limit = 50, page = 1, semester, faculty, active = true } = {};
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const query = {};
        if (active !== 'false') {
            query.is_active = true;
        }
        
        const courses = await memoryStore.find('courses', query, { 
            sort: 'code', 
            limit: parseInt(limit), 
            skip 
        });
        console.log('Courses result length:', courses.length);
        
        console.log('Testing news endpoint logic...');
        const { limit: newsLimit = 10, page: newsPage = 1, category, featured } = {};
        const newsSkip = (parseInt(newsPage) - 1) * parseInt(newsLimit);
        
        const newsQuery = {};
        if (featured === 'true') {
            newsQuery.is_featured = true;
        }
        
        const news = await memoryStore.find('news', newsQuery, { 
            sort: 'publish_date', 
            order: 'desc',
            limit: parseInt(newsLimit), 
            skip: newsSkip 
        });
        console.log('News result length:', news.length);
        
        console.log('Testing events endpoint logic...');
        const { limit: eventLimit = 10, page: eventPage = 1, type, status = 'upcoming' } = {};
        const eventSkip = (parseInt(eventPage) - 1) * parseInt(eventLimit);
        
        const eventQuery = {};
        if (status === 'upcoming') {
            eventQuery.start_date = new Date();
        }
        
        const events = await memoryStore.find('events', eventQuery, { 
            sort: 'start_date', 
            limit: parseInt(eventLimit), 
            skip: eventSkip 
        });
        console.log('Events result length:', events.length);
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testServerCalls();
