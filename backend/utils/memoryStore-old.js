const { seedFaculty, seedNews, seedEvents, seedCourses } = require('./seedData');

class MemoryStore {
    constructor() {
        this.collections = {
            faculty: [],
            news: [],
            events: [],
            courses: [],
            contactmessages: []
        };
        this.nextId = 1;
    }

    async initialize() {
        this.collections.faculty = seedFaculty.map(item => ({ 
            ...item, 
            _id: this.generateId(), 
            is_active: item.is_active !== undefined ? item.is_active : true,
            createdAt: new Date(), 
            updatedAt: new Date() 
        }));
        this.collections.news = seedNews.map(item => ({ 
            ...item, 
            _id: this.generateId(), 
            is_featured: item.is_featured !== undefined ? item.is_featured : false,
            createdAt: new Date(), 
            updatedAt: new Date() 
        }));
        this.collections.events = seedEvents.map(item => ({ 
            ...item, 
            _id: this.generateId(), 
            status: item.status || 'upcoming',
            createdAt: new Date(), 
            updatedAt: new Date() 
        }));
        this.collections.courses = seedCourses.map(item => ({ 
            ...item, 
            _id: this.generateId(), 
            is_active: item.is_active !== undefined ? item.is_active : true,
            createdAt: new Date(), 
            updatedAt: new Date() 
        }));
        console.log('Memory store initialized with seed data');
        console.log(`Faculty: ${this.collections.faculty.length}, News: ${this.collections.news.length}, Events: ${this.collections.events.length}, Courses: ${this.collections.courses.length}`);
    }

    generateId() {
        return this.nextId++ + '';
    }

    async find(collection, query = {}, options = {}) {
        let data = [...this.collections[collection]];
        
        // Filter by is_active
        if (query.is_active !== undefined) {
            const isActive = query.is_active === 'true' || query.is_active === true;
            data = data.filter(item => item.is_active === isActive);
        }
        
        // Filter by category
        if (query.category) {
            data = data.filter(item => item.category === query.category);
        }
        
        // Filter by is_featured
        if (query.is_featured !== undefined) {
            const isFeatured = query.is_featured === 'true' || query.is_featured === true;
            data = data.filter(item => item.is_featured === isFeatured);
        }
        
        // Filter by type
        if (query.type) {
            data = data.filter(item => item.type === query.type);
        }
        
        // Filter by status
        if (query.status) {
            data = data.filter(item => item.status === query.status);
        }
        
        // Filter by message_type
        if (query.message_type) {
            data = data.filter(item => item.message_type === query.message_type);
        }
        
        // Filter by semester
        if (query.semester) {
            data = data.filter(item => item.semester === query.semester);
        }
        
        // Filter by faculty (case-insensitive search)
        if (query.faculty) {
            const searchLower = query.faculty.toLowerCase();
            data = data.filter(item => 
                item.faculty && item.faculty.toLowerCase().includes(searchLower)
            );
        }
        
        // Filter by start_date (upcoming events)
        if (query.start_date) {
            const queryDate = new Date(query.start_date);
            data = data.filter(item => new Date(item.start_date) >= queryDate);
        }
        
        // Filter by end_date (past events)
        if (query.end_date) {
            const queryDate = new Date(query.end_date);
            data = data.filter(item => new Date(item.end_date) < queryDate);
        }
        
        // Sort results
        if (options.sort) {
            const sortField = options.sort;
            const sortOrder = options.order === 'desc' ? -1 : 1;
            data.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                // Handle date fields
                if (['publish_date', 'start_date', 'end_date', 'createdAt', 'updatedAt'].includes(sortField)) {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                
                if (aVal < bVal) return -sortOrder;
                if (aVal > bVal) return sortOrder;
                return 0;
            });
        }
        
        // Apply pagination
        if (options.limit) {
            const skip = options.skip || 0;
            const limit = parseInt(options.limit);
            data = data.slice(skip, skip + limit);
        }
        
        return data;
    }

    async findById(collection, id) {
        return this.collections[collection].find(item => item._id === id);
    }

    async create(collection, data) {
        const newItem = {
            ...data,
            _id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.collections[collection].push(newItem);
        return newItem;
    }

    async updateById(collection, id, data) {
        const index = this.collections[collection].findIndex(item => item._id === id);
        if (index === -1) return null;
        
        this.collections[collection][index] = {
            ...this.collections[collection][index],
            ...data,
            updatedAt: new Date()
        };
        return this.collections[collection][index];
    }

    async deleteById(collection, id) {
        const index = this.collections[collection].findIndex(item => item._id === id);
        if (index === -1) return false;
        
        this.collections[collection].splice(index, 1);
        return true;
    }

    async countDocuments(collection, query = {}) {
        const data = await this.find(collection, query, {});
        return data.length;
    }
}

module.exports = new MemoryStore();
