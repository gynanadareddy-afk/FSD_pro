const memoryStore = require('./utils/memoryStore');

async function testEndpoints() {
    try {
        await memoryStore.initialize();
        
        console.log('Testing courses...');
        const courses = await memoryStore.find('courses', {}, { sort: 'code' });
        console.log('Courses result:', courses.length);
        
        console.log('Testing news...');
        const news = await memoryStore.find('news', {}, { sort: 'publish_date', order: 'desc' });
        console.log('News result:', news.length);
        
        console.log('Testing events...');
        const events = await memoryStore.find('events', {}, { sort: 'start_date' });
        console.log('Events result:', events.length);
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testEndpoints();
