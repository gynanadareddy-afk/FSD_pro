const memoryStore = require('./utils/memoryStore');

async function testMemoryStore() {
    try {
        await memoryStore.initialize();
        
        console.log('Testing faculty find...');
        const faculty = await memoryStore.find('faculty', {}, {});
        console.log('Faculty result:', faculty.length, faculty[0]);
        
        console.log('Testing news find...');
        const news = await memoryStore.find('news', {}, {});
        console.log('News result:', news.length, news[0]);
        
        console.log('Testing news with sorting...');
        const newsSorted = await memoryStore.find('news', {}, { sort: 'publish_date', order: 'desc' });
        console.log('News sorted result:', newsSorted.length, newsSorted[0]);
        
    } catch (error) {
        console.error('Test error:', error);
        console.error('Stack:', error.stack);
    }
}

testMemoryStore();
