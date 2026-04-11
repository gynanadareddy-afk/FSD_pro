# CSE Department Database Setup

## Overview
This database provides an optimized backend for the CSE Department website with proper indexing, relationships, and performance optimization.

## Database Features
- **Optimized Design**: Proper indexing for fast queries
- **Normalization**: 3NF normalized structure
- **Relationships**: Foreign key constraints for data integrity
- **Scalability**: Designed to handle growth
- **Security**: Prepared statements to prevent SQL injection

## Tables Structure

### Core Tables
- **users**: Authentication and user management
- **faculty**: Faculty information and profiles
- **programs**: Academic programs (B.Tech, M.Tech, etc.)
- **program_resources**: Syllabi and curriculum documents
- **research_areas**: Research domains and specializations
- **research_publications**: Faculty publications and papers
- **events**: Department events and activities
- **news**: News and announcements
- **infrastructure**: Labs, classrooms, and facilities
- **outreach_activities**: Community engagement programs

### Supporting Tables
- **faculty_research_areas**: Many-to-many relationship
- **user_sessions**: Authentication sessions
- **contact_messages**: Contact form submissions

## Setup Instructions

### Prerequisites
- PHP 7.4+ with PDO extension
- MySQL 5.7+ or MariaDB 10.2+
- Web server (Apache/Nginx)

### Step 1: Database Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/database
   ```

2. Run the setup script:
   ```bash
   php setup.php
   ```

3. Or manually import the schema:
   ```bash
   mysql -u root -p cse_department < schema.sql
   ```

### Step 2: Configure Database Connection
Edit `backend/config/Database.php` with your database credentials:

```php
private $host = 'localhost';
private $db_name = 'cse_department';
private $username = 'root';
private $password = 'your_password';
```

### Step 3: Test API Endpoints
Open your browser and test:
- `http://localhost/backend/api/index.php?endpoint=faculty`
- `http://localhost/backend/api/index.php?endpoint=news`
- `http://localhost/backend/api/index.php?endpoint=events`

## API Endpoints

### Available Endpoints
- `GET /api/index.php?endpoint=faculty` - Get all faculty
- `GET /api/index.php?endpoint=news&limit=3` - Get news (limit optional)
- `GET /api/index.php?endpoint=events&limit=3` - Get upcoming events
- `GET /api/index.php?endpoint=programs` - Get academic programs
- `GET /api/index.php?endpoint=research-areas` - Get research areas
- `GET /api/index.php?endpoint=outreach` - Get outreach activities
- `POST /api/index.php?endpoint=contact` - Submit contact form
- `GET /api/index.php?endpoint=statistics` - Get dashboard statistics

### Response Format
```json
{
  "success": true,
  "data": [...]
}
```

## Performance Optimizations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes
- Search indexes (email, names, dates)
- Composite indexes for common queries

### Query Optimization
- Prepared statements for security
- Connection pooling enabled
- Efficient JOIN operations
- Proper WHERE clause indexing

### Caching Considerations
- Static data (programs, research areas) can be cached
- News and events have date-based indexing
- Faculty data includes related research areas

## Security Features

### Database Security
- Prepared statements prevent SQL injection
- Input validation on all endpoints
- CORS headers for API access
- Error handling without exposing sensitive data

### Data Integrity
- Foreign key constraints
- NOT NULL constraints on critical fields
- ENUM types for controlled values
- Timestamp tracking for audit trails

## Sample Data Included

### Initial Data
- 6 research areas (AI, Cybersecurity, etc.)
- 5 academic programs
- 3 sample users (admin, student, faculty)
- 2 sample events
- 2 sample news items

### Test Credentials
- Admin: admin@cse.edu
- Student: student1@cse.edu  
- Faculty: faculty1@cse.edu

## Maintenance

### Regular Tasks
- Backup database weekly
- Monitor query performance
- Update statistics for query optimizer
- Clean expired user sessions

### Scaling Considerations
- Add read replicas for high traffic
- Implement query caching
- Consider partitioning for large tables
- Monitor and optimize slow queries

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check database credentials
2. **Table Not Found**: Run setup script
3. **Slow Queries**: Check indexes and EXPLAIN plans
4. **CORS Errors**: Verify API endpoint configuration

### Debug Mode
Enable error reporting in development:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Integration Notes

### Frontend Integration
The frontend JavaScript automatically:
- Fetches data from API endpoints
- Falls back to static data if API fails
- Handles loading states gracefully
- Implements error handling

### Future Enhancements
- User authentication system
- File upload for syllabi/documents
- Search functionality
- Real-time notifications
- Analytics dashboard
