-- CSE Department Database Schema
-- Optimized for performance with proper indexing and relationships

-- Users Table (Authentication and User Management)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_type ENUM('student', 'faculty', 'admin', 'staff') NOT NULL,
    profile_image VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_user_type (user_type)
);

-- Academic Programs Table
CREATE TABLE programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(100) NOT NULL,
    program_type ENUM('btech', 'mtech', 'dual_degree', 'phd') NOT NULL,
    duration_years INT NOT NULL,
    description TEXT,
    admission_requirements TEXT,
    curriculum_outline TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_program_type (program_type),
    INDEX idx_program_name (program_name)
);

-- Program Resources Table (Syllabi and Documents)
CREATE TABLE program_resources (
    resource_id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    resource_name VARCHAR(100) NOT NULL,
    resource_type ENUM('syllabus', 'scheme_syllabus', 'curriculum', 'other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    year_start INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE,
    INDEX idx_program_year (program_id, year_start),
    INDEX idx_resource_type (resource_type)
);

-- Faculty Table
CREATE TABLE faculty (
    faculty_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(50) DEFAULT 'Computer Science',
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization TEXT,
    education_qualifications TEXT,
    research_interests TEXT,
    publications_count INT DEFAULT 0,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_designation (designation),
    INDEX idx_email (email),
    INDEX idx_last_name (last_name)
);

-- Research Areas Table
CREATE TABLE research_areas (
    area_id INT PRIMARY KEY AUTO_INCREMENT,
    area_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_area_name (area_name)
);

-- Faculty Research Areas (Many-to-Many)
CREATE TABLE faculty_research_areas (
    faculty_id INT NOT NULL,
    area_id INT NOT NULL,
    PRIMARY KEY (faculty_id, area_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES research_areas(area_id) ON DELETE CASCADE
);

-- Research Publications Table
CREATE TABLE research_publications (
    publication_id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    publication_type ENUM('journal', 'conference', 'book', 'patent') NOT NULL,
    publication_year INT NOT NULL,
    journal_name VARCHAR(100),
    conference_name VARCHAR(100),
    doi VARCHAR(100),
    citations_count INT DEFAULT 0,
    abstract TEXT,
    authors TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    INDEX idx_faculty_year (faculty_id, publication_year),
    INDEX idx_publication_type (publication_type),
    INDEX idx_publication_year (publication_year)
);

-- Events Table
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type ENUM('seminar', 'workshop', 'conference', 'guest_lecture', 'competition', 'other') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    venue VARCHAR(100),
    organizer VARCHAR(100),
    target_audience TEXT,
    registration_required BOOLEAN DEFAULT FALSE,
    max_participants INT,
    current_participants INT DEFAULT 0,
    poster_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_date (start_date),
    INDEX idx_event_type (event_type),
    INDEX idx_start_date (start_date)
);

-- News Table
CREATE TABLE news (
    news_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    news_type ENUM('announcement', 'achievement', 'event_update', 'general') NOT NULL,
    author VARCHAR(100),
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_publish_date (publish_date),
    INDEX idx_news_type (news_type),
    INDEX idx_featured (is_featured)
);

-- Infrastructure Facilities Table
CREATE TABLE infrastructure (
    facility_id INT PRIMARY KEY AUTO_INCREMENT,
    facility_name VARCHAR(100) NOT NULL,
    facility_type ENUM('lab', 'classroom', 'auditorium', 'library', 'other') NOT NULL,
    capacity INT,
    location VARCHAR(100),
    equipment TEXT,
    description TEXT,
    images JSON,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_facility_type (facility_type),
    INDEX idx_location (location)
);

-- Outreach Activities Table
CREATE TABLE outreach_activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_name VARCHAR(100) NOT NULL,
    activity_type ENUM('school_program', 'community_training', 'women_in_tech', 'innovation_lab', 'teacher_training', 'open_source') NOT NULL,
    description TEXT,
    target_audience TEXT,
    impact_statistics JSON,
    images JSON,
    start_date DATE,
    end_date DATE,
    status ENUM('planning', 'ongoing', 'completed', 'cancelled') DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activity_type (activity_type),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
);

-- User Sessions (For Authentication)
CREATE TABLE user_sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    phone VARCHAR(20),
    message_type ENUM('general', 'admission', 'research', 'complaint', 'other') DEFAULT 'general',
    status ENUM('unread', 'read', 'replied', 'closed') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_message_type (message_type),
    INDEX idx_created_at (created_at)
);

-- Insert Sample Data

-- Research Areas
INSERT INTO research_areas (area_name, description, icon_class) VALUES
('Artificial Intelligence', 'Machine learning, deep learning, natural language processing', 'fas fa-brain'),
('Cybersecurity', 'Network security, cryptography, ethical hacking', 'fas fa-shield-alt'),
('Computer Networks', 'Wireless networks, IoT, network protocols', 'fas fa-network-wired'),
('Data Science', 'Big data analytics, data mining, statistical analysis', 'fas fa-database'),
('Robotics', 'Autonomous systems, computer vision, control systems', 'fas fa-robot'),
('Cloud Computing', 'Distributed systems, cloud architecture, edge computing', 'fas fa-cloud');

-- Programs
INSERT INTO programs (program_name, program_type, duration_years, description) VALUES
('B.Tech in Computer Science and Engineering', 'btech', 4, '4-year undergraduate program focusing on fundamental and advanced computer science concepts.'),
('Dual Degree in Computer Science and Engineering', 'dual_degree', 5, '5-year integrated program combining undergraduate and postgraduate studies.'),
('M.Tech in Computer Science and Engineering', 'mtech', 2, '2-year postgraduate program with specialization in advanced computing technologies.'),
('M.Tech in Computer Science and Engineering (2024 Onwards)', 'mtech', 2, '2-year postgraduate program with updated curriculum and advanced computing technologies.'),
('M.Tech in Computer Science and Engineering with Specialization in Cyber Security', 'mtech', 2, '2-year specialized postgraduate program focusing on cybersecurity and information assurance.');

-- Sample Users
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type) VALUES
('admin', 'admin@cse.edu', '$2b$12$hashed_password_here', 'Admin', 'User', 'admin'),
('student1', 'student1@cse.edu', '$2b$12$hashed_password_here', 'John', 'Doe', 'student'),
('faculty1', 'faculty1@cse.edu', '$2b$12$hashed_password_here', 'Jane', 'Smith', 'faculty');

-- Sample Events
INSERT INTO events (title, description, event_type, start_date, end_date, venue, organizer) VALUES
('AI Workshop', 'Introduction to Artificial Intelligence and Machine Learning', 'workshop', '2024-04-15 10:00:00', '2024-04-15 16:00:00', 'Lab 301', 'Dr. Jane Smith'),
('Guest Lecture on Cybersecurity', 'Latest trends in cybersecurity and network protection', 'guest_lecture', '2024-04-20 14:00:00', '2024-04-20 15:30:00', 'Auditorium', 'Dr. John Doe');

-- Sample News
INSERT INTO news (title, content, news_type, author) VALUES
('New Research Lab Inaugurated', 'The department inaugurated a new AI research lab with state-of-the-art facilities.', 'achievement', 'Admin'),
('Student Achievement in Hackathon', 'Our students won first place in the national hackathon competition.', 'achievement', 'Admin');
