const memoryStore = require('./utils/memoryStore');

async function quickTest() {
    try {
        await memoryStore.initialize();
        console.log('Memory store initialized');
        
        // Test the exact call that's failing
        const query = { is_active: true };
        console.log('Testing courses find with query:', query);
        
        const courses = await memoryStore.find('courses', query, { 
            sort: 'code', 
            limit: 50, 
            skip: 0 
        });
        
        console.log('SUCCESS: Found', courses.length, 'courses');
        console.log('First course:', courses[0]);
        
    } catch (error) {
        console.error('ERROR:', error.message);
        console.error('STACK:', error.stack);
    }
}

quickTest();
