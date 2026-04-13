const Faculty = require('../models/Faculty');
const News = require('../models/News');
const Event = require('../models/Event');
const Course = require('../models/Course');

const seedFaculty = [
    {
        first_name: 'Rajesh',
        last_name: 'Kumar',
        designation: 'Professor & Head',
        email: 'rajesh.kumar@csecollege.edu',
        bio: 'Dr. Rajesh Kumar has over 20 years of experience in AI and ML research.',
        research_areas: [
            { area_name: 'Artificial Intelligence', description: 'Machine learning and deep learning research' },
            { area_name: 'Machine Learning', description: 'Advanced ML algorithms and applications' },
            { area_name: 'Data Science', description: 'Big data analytics and data mining' }
        ],
        education_qualifications: 'Ph.D. in Computer Science, IIT Bombay',
        publications_count: 45
    },
    {
        first_name: 'Priya',
        last_name: 'Sharma',
        designation: 'Associate Professor',
        email: 'priya.sharma@csecollege.edu',
        bio: 'Dr. Priya Sharma specializes in cybersecurity and has published 50+ research papers.',
        research_areas: [
            { area_name: 'Cybersecurity', description: 'Network security and defense mechanisms' },
            { area_name: 'Network Security', description: 'Secure network protocols and architectures' },
            { area_name: 'Cryptography', description: 'Encryption and cryptographic protocols' }
        ],
        education_qualifications: 'Ph.D. in Cybersecurity, MIT',
        publications_count: 52
    },
    {
        first_name: 'Amit',
        last_name: 'Patel',
        designation: 'Assistant Professor',
        email: 'amit.patel@csecollege.edu',
        bio: 'Dr. Amit Patel works on cloud computing and distributed systems research.',
        research_areas: [
            { area_name: 'Cloud Computing', description: 'Cloud architecture and services' },
            { area_name: 'Distributed Systems', description: 'Large-scale distributed computing' },
            { area_name: 'Internet of Things', description: 'IoT systems and applications' }
        ],
        education_qualifications: 'Ph.D. in Distributed Systems, Stanford',
        publications_count: 28
    }
];

const seedNews = [
    {
        title: 'CSE Department Wins National Tech Innovation Award',
        content: 'Our department has been recognized for outstanding contributions to technology innovation and research excellence. The award was presented at the National Education Summit 2026.',
        publish_date: new Date('2026-03-01T00:00:00Z'),
        author: 'Department Admin',
        category: 'Achievements',
        news_type: 'achievement',
        is_featured: true
    },
    {
        title: 'New AI Lab Inaugurated',
        content: 'A new AI laboratory with advanced computing resources was inaugurated for student and faculty research. The lab features state-of-the-art GPUs and specialized AI software.',
        publish_date: new Date('2026-02-28T00:00:00Z'),
        author: 'Department Admin',
        category: 'Infrastructure',
        news_type: 'achievement'
    },
    {
        title: 'Faculty Recruitment Open',
        content: 'Applications are invited for Assistant Professor positions in Computer Science and Engineering. Candidates with expertise in AI, Cybersecurity, and Data Science are encouraged to apply.',
        publish_date: new Date('2026-02-25T00:00:00Z'),
        author: 'HR Department',
        category: 'Recruitment',
        news_type: 'announcement'
    }
];

const seedEvents = [
    {
        title: 'AI Workshop: Deep Learning Fundamentals',
        description: 'Hands-on workshop covering the fundamentals of deep learning and neural networks. Participants will work on real-world projects and learn TensorFlow.',
        start_date: new Date('2026-05-15T09:00:00Z'),
        end_date: new Date('2026-05-15T17:00:00Z'),
        venue: 'Computer Lab 301',
        speaker: 'Dr. Rajesh Kumar',
        type: 'Workshop',
        organizer: 'AI Research Group',
        target_audience: 'CSE Students (3rd and 4th year)',
        registration_required: true,
        max_participants: 30,
        status: 'upcoming'
    },
    {
        title: 'Tech Talk: Future of Quantum Computing',
        description: 'Expert talk on the emerging field of quantum computing and its applications in cryptography and optimization problems.',
        start_date: new Date('2026-05-20T10:00:00Z'),
        end_date: new Date('2026-05-20T11:30:00Z'),
        venue: 'Auditorium',
        speaker: 'Industry Expert',
        type: 'Seminar',
        organizer: 'Computer Science Association',
        target_audience: 'All Students and Faculty',
        registration_required: false,
        status: 'upcoming'
    },
    {
        title: 'Hackathon 2026',
        description: 'A 24-hour coding competition focused on solving real-world engineering problems. Great prizes and internship opportunities!',
        start_date: new Date('2026-06-01T08:00:00Z'),
        end_date: new Date('2026-06-02T08:00:00Z'),
        venue: 'Innovation Center',
        speaker: 'Multiple Industry Experts',
        type: 'Competition',
        organizer: 'Tech Club',
        target_audience: 'All Engineering Students',
        registration_required: true,
        max_participants: 100,
        status: 'upcoming'
    }
];

const seedCourses = [
    {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        credits: 4,
        semester: 'Fall',
        description: 'Fundamental concepts of data structures and algorithm design. Includes arrays, linked lists, trees, graphs, sorting and searching algorithms.',
        faculty: 'Dr. Rajesh Kumar',
        type: 'core',
        prerequisites: ['CS101'],
        syllabus: 'Introduction to data structures, arrays, linked lists, stacks, queues, trees, graphs, sorting algorithms, searching algorithms, complexity analysis.'
    },
    {
        name: 'Artificial Intelligence',
        code: 'CS301',
        credits: 3,
        semester: 'Spring',
        description: 'Introduction to AI concepts, machine learning, and neural networks. Covers search algorithms, knowledge representation, and learning systems.',
        faculty: 'Dr. Rajesh Kumar',
        type: 'elective',
        prerequisites: ['CS201', 'MA203'],
        syllabus: 'History of AI, search strategies, knowledge representation, logical reasoning, machine learning basics, neural networks, natural language processing.'
    },
    {
        name: 'Cybersecurity',
        code: 'CS302',
        credits: 3,
        semester: 'Spring',
        description: 'Fundamentals of cybersecurity, network security, and ethical hacking. Includes hands-on security labs and penetration testing.',
        faculty: 'Dr. Priya Sharma',
        type: 'elective',
        prerequisites: ['CS201', 'CS205'],
        syllabus: 'Security fundamentals, cryptography, network security, application security, ethical hacking, security policies, incident response.'
    },
    {
        name: 'Cloud Computing',
        code: 'CS303',
        credits: 3,
        semester: 'Fall',
        description: 'Cloud architecture, services, and deployment models. Practical experience with AWS, Azure, and Google Cloud platforms.',
        faculty: 'Dr. Amit Patel',
        type: 'elective',
        prerequisites: ['CS201', 'CS205'],
        syllabus: 'Cloud computing basics, service models (IaaS, PaaS, SaaS), deployment models, virtualization, containerization, serverless computing, cloud security.'
    }
];

const seedContactMessages = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'General enquiry',
        message: 'Hi, I would like to know more about the CSE programs.',
        phone: '',
        message_type: 'general',
        status: 'unread',
        priority: 'medium',
        createdAt: new Date('2026-03-20T10:00:00Z')
    }
];

async function seedCollection(Model, documents) {
    try {
        const count = await Model.countDocuments();
        if (count === 0) {
            await Model.insertMany(documents);
            console.log(`Seeded ${Model.modelName} with ${documents.length} documents`);
            return true;
        } else {
            console.log(`${Model.modelName} already has ${count} documents, skipping seed`);
            return false;
        }
    } catch (error) {
        console.error(`Error seeding ${Model.modelName}:`, error);
        return false;
    }
}

async function seedDatabase() {
    console.log('Starting database seeding...');
    
    const results = await Promise.all([
        seedCollection(Faculty, seedFaculty),
        seedCollection(News, seedNews),
        seedCollection(Event, seedEvents),
        seedCollection(Course, seedCourses)
    ]);

    const successCount = results.filter(Boolean).length;
    console.log(`Database seeding completed. ${successCount}/4 collections seeded.`);
    
    return successCount > 0;
}

module.exports = {
    seedDatabase,
    seedFaculty,
    seedNews,
    seedEvents,
    seedCourses,
    seedContactMessages
};
