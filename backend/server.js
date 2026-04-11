const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { MongoMemoryServer } = require('mongodb-memory-server-core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendRoot = path.join(__dirname, '../frontend');

const facultySchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        designation: { type: String, required: true },
        email: { type: String, required: true },
        profile_image: String,
        bio: String,
        is_active: { type: Boolean, default: true },
        research_areas: [
            {
                area_name: { type: String, required: true },
                description: { type: String, default: '' }
            }
        ]
    },
    { versionKey: false, timestamps: true }
);

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        publish_date: { type: Date, required: true },
        author: { type: String, required: true },
        category: { type: String, required: true }
    },
    { versionKey: false, timestamps: true }
);

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        start_date: { type: Date, required: true },
        venue: { type: String, required: true },
        speaker: { type: String, required: true },
        type: { type: String, required: true }
    },
    { versionKey: false, timestamps: true }
);

const courseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true },
        credits: { type: Number, required: true },
        semester: { type: String, required: true },
        description: { type: String, required: true },
        faculty: { type: String, required: true }
    },
    { versionKey: false, timestamps: true }
);

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        subject: { type: String, default: '' },
        message: { type: String, required: true },
        phone: { type: String, default: '' },
        message_type: { type: String, default: 'general' }
    },
    { versionKey: false, timestamps: true }
);

const Faculty = mongoose.model('Faculty', facultySchema);
const News = mongoose.model('News', newsSchema);
const Event = mongoose.model('Event', eventSchema);
const Course = mongoose.model('Course', courseSchema);
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

const seedFaculty = [
    {
        first_name: 'Rajesh',
        last_name: 'Kumar',
        designation: 'Professor & Head',
        email: 'rajesh.kumar@csecollege.edu',
        bio: 'Dr. Rajesh Kumar has over 20 years of experience in AI and ML research.',
        research_areas: [
            { area_name: 'Artificial Intelligence' },
            { area_name: 'Machine Learning' },
            { area_name: 'Data Science' }
        ]
    },
    {
        first_name: 'Priya',
        last_name: 'Sharma',
        designation: 'Associate Professor',
        email: 'priya.sharma@csecollege.edu',
        bio: 'Dr. Priya Sharma specializes in cybersecurity and has published 50+ research papers.',
        research_areas: [
            { area_name: 'Cybersecurity' },
            { area_name: 'Network Security' },
            { area_name: 'Cryptography' }
        ]
    },
    {
        first_name: 'Amit',
        last_name: 'Patel',
        designation: 'Assistant Professor',
        email: 'amit.patel@csecollege.edu',
        bio: 'Dr. Amit Patel works on cloud computing and distributed systems research.',
        research_areas: [
            { area_name: 'Cloud Computing' },
            { area_name: 'Distributed Systems' },
            { area_name: 'Internet of Things' }
        ]
    }
];

const seedNews = [
    {
        title: 'CSE Department Wins National Tech Innovation Award',
        content: 'Our department has been recognized for outstanding contributions to technology innovation and research excellence.',
        publish_date: new Date('2026-03-01T00:00:00Z'),
        author: 'Department Admin',
        category: 'Achievements'
    },
    {
        title: 'New AI Lab Inaugurated',
        content: 'A new AI laboratory with advanced computing resources was inaugurated for student and faculty research.',
        publish_date: new Date('2026-02-28T00:00:00Z'),
        author: 'Department Admin',
        category: 'Infrastructure'
    },
    {
        title: 'Faculty Recruitment Open',
        content: 'Applications are invited for Assistant Professor positions in Computer Science and Engineering.',
        publish_date: new Date('2026-02-25T00:00:00Z'),
        author: 'HR Department',
        category: 'Recruitment'
    }
];

const seedEvents = [
    {
        title: 'AI Workshop: Deep Learning Fundamentals',
        description: 'Hands-on workshop covering the fundamentals of deep learning and neural networks.',
        start_date: new Date('2026-05-15T09:00:00Z'),
        venue: 'Computer Lab 301',
        speaker: 'Dr. Rajesh Kumar',
        type: 'Workshop'
    },
    {
        title: 'Tech Talk: Future of Quantum Computing',
        description: 'Expert talk on the emerging field of quantum computing and its applications.',
        start_date: new Date('2026-05-20T10:00:00Z'),
        venue: 'Auditorium',
        speaker: 'Industry Expert',
        type: 'Seminar'
    },
    {
        title: 'Hackathon 2026',
        description: 'A 24-hour coding competition focused on solving real-world engineering problems.',
        start_date: new Date('2026-06-01T08:00:00Z'),
        venue: 'Innovation Center',
        speaker: 'Multiple',
        type: 'Competition'
    }
];

const seedCourses = [
    {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        credits: 4,
        semester: 'Fall',
        description: 'Fundamental concepts of data structures and algorithm design.',
        faculty: 'Dr. Rajesh Kumar'
    },
    {
        name: 'Artificial Intelligence',
        code: 'CS301',
        credits: 3,
        semester: 'Spring',
        description: 'Introduction to AI concepts, machine learning, and neural networks.',
        faculty: 'Dr. Rajesh Kumar'
    },
    {
        name: 'Cybersecurity',
        code: 'CS302',
        credits: 3,
        semester: 'Spring',
        description: 'Fundamentals of cybersecurity, network security, and ethical hacking.',
        faculty: 'Dr. Priya Sharma'
    },
    {
        name: 'Cloud Computing',
        code: 'CS303',
        credits: 3,
        semester: 'Fall',
        description: 'Cloud architecture, services, and deployment models.',
        faculty: 'Dr. Amit Patel'
    }
];

let mongoServer;
let httpServer;

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(frontendRoot));

async function seedCollection(Model, documents) {
    const count = await Model.countDocuments();
    if (count === 0) {
        await Model.insertMany(documents);
    }
}

async function seedDatabase() {
    await Promise.all([
        seedCollection(Faculty, seedFaculty),
        seedCollection(News, seedNews),
        seedCollection(Event, seedEvents),
        seedCollection(Course, seedCourses)
    ]);
}

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: frontendRoot });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
});

app.get('/api/faculty', async (req, res, next) => {
    try {
        const faculty = await Faculty.find({ is_active: true }).sort({ last_name: 1, first_name: 1 }).lean();
        res.json({ success: true, data: faculty });
    } catch (error) {
        next(error);
    }
});

app.get('/api/news', async (req, res, next) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const news = await News.find().sort({ publish_date: -1 }).limit(limit).lean();
        res.json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
});

app.get('/api/events', async (req, res, next) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const events = await Event.find({ start_date: { $gte: new Date() } }).sort({ start_date: 1 }).limit(limit).lean();
        res.json({ success: true, data: events });
    } catch (error) {
        next(error);
    }
});

app.get('/api/courses', async (req, res, next) => {
    try {
        const courses = await Course.find().sort({ code: 1 }).lean();
        res.json({ success: true, data: courses });
    } catch (error) {
        next(error);
    }
});

app.post('/api/contact', async (req, res, next) => {
    try {
        const { name, email, subject = '', message, phone = '', message_type = 'general' } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const contactMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message,
            phone,
            message_type
        });

        res.status(201).json({ success: true, message_id: contactMessage._id });
    } catch (error) {
        next(error);
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

async function stopServer() {
    if (httpServer) {
        await new Promise((resolve, reject) => {
            httpServer.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
}

async function startServer() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri('cse_department');

    await mongoose.connect(mongoUri);
    await seedDatabase();

    httpServer = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`In-memory MongoDB started at ${mongoUri}`);
        console.log(`Open http://localhost:${PORT} to view the website`);
    });
}

['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
        await stopServer();
        process.exit(0);
    });
});

startServer().catch(async (error) => {
    console.error('Failed to start server:', error);
    await stopServer();
    process.exit(1);
});
