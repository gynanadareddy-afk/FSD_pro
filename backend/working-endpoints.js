// Working endpoints to replace the problematic ones

const workingCoursesEndpoint = async (req, res, next) => {
    try {
        const { limit = 50, page = 1, semester, faculty, active = true } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let courses, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (semester) query.semester = semester;
            if (faculty) query.faculty = new RegExp(faculty, 'i');
            if (active !== 'false') query.is_active = true;
            
            courses = await Course.find(query).sort({ code: 1 }).limit(parseInt(limit)).skip(skip).lean();
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
};

const workingNewsEndpoint = async (req, res, next) => {
    try {
        const { limit = 10, page = 1, category, featured } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let news, total;
        
        if (database.isPersistent()) {
            const query = {};
            if (category) query.category = category;
            if (featured === 'true') query.is_featured = true;
            
            news = await News.find(query).sort({ publish_date: -1 }).limit(parseInt(limit)).skip(skip).lean();
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
};

const workingEventsEndpoint = async (req, res, next) => {
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
            
            events = await Event.find(query).sort({ start_date: 1 }).limit(parseInt(limit)).skip(skip).lean();
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
};

module.exports = {
    workingCoursesEndpoint,
    workingNewsEndpoint,
    workingEventsEndpoint
};
