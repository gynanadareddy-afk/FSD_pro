// Quick test script to test API endpoints
const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function test() {
    console.log('Testing API endpoints...\n');
    
    try {
        console.log('GET /api/debug/memorystore');
        const memstore = await makeRequest('/api/debug/memorystore');
        console.log(JSON.stringify(memstore, null, 2));
        
        console.log('\n\nGET /api/courses');
        const courses = await makeRequest('/api/courses');
        console.log(JSON.stringify(courses, null, 2));
        
        console.log('\n\nGET /api/news');
        const news = await makeRequest('/api/news');
        console.log(JSON.stringify(news, null, 2));
        
        console.log('\n\nGET /api/events');
        const events = await makeRequest('/api/events');
        console.log(JSON.stringify(events, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
