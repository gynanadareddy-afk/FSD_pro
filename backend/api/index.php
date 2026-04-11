<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

class APIController {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    // Faculty API
    public function getFaculty() {
        try {
            $sql = "SELECT f.*, u.username, u.profile_image as user_image 
                    FROM faculty f 
                    LEFT JOIN users u ON f.user_id = u.user_id 
                    WHERE f.is_active = 1 
                    ORDER BY f.last_name ASC";
            
            $faculty = $this->db->fetchAll($sql);
            
            // Get research areas for each faculty
            foreach ($faculty as &$member) {
                $areasSql = "SELECT ra.area_name, ra.description 
                            FROM research_areas ra 
                            JOIN faculty_research_areas fra ON ra.area_id = fra.area_id 
                            WHERE fra.faculty_id = ?";
                $member['research_areas'] = $this->db->fetchAll($areasSql, [$member['faculty_id']]);
            }
            
            echo json_encode(['success' => true, 'data' => $faculty]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // News API
    public function getNews($limit = 10) {
        try {
            $sql = "SELECT * FROM news 
                    ORDER BY publish_date DESC 
                    LIMIT ?";
            $news = $this->db->fetchAll($sql, [$limit]);
            
            echo json_encode(['success' => true, 'data' => $news]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // Events API
    public function getEvents($limit = 10) {
        try {
            $sql = "SELECT * FROM events 
                    WHERE start_date >= NOW() 
                    ORDER BY start_date ASC 
                    LIMIT ?";
            $events = $this->db->fetchAll($sql, [$limit]);
            
            echo json_encode(['success' => true, 'data' => $events]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // Programs API
    public function getPrograms() {
        try {
            $sql = "SELECT * FROM programs ORDER BY program_type, program_name";
            $programs = $this->db->fetchAll($sql);
            
            // Get resources for each program
            foreach ($programs as &$program) {
                $resourcesSql = "SELECT * FROM program_resources 
                                WHERE program_id = ? 
                                ORDER BY year_start DESC";
                $program['resources'] = $this->db->fetchAll($resourcesSql, [$program['program_id']]);
            }
            
            echo json_encode(['success' => true, 'data' => $programs]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // Research Areas API
    public function getResearchAreas() {
        try {
            $sql = "SELECT * FROM research_areas ORDER BY area_name";
            $areas = $this->db->fetchAll($sql);
            
            echo json_encode(['success' => true, 'data' => $areas]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // Outreach Activities API
    public function getOutreachActivities() {
        try {
            $sql = "SELECT * FROM outreach_activities 
                    ORDER BY start_date DESC";
            $activities = $this->db->fetchAll($sql);
            
            echo json_encode(['success' => true, 'data' => $activities]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // Contact Form API
    public function submitContact() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
                throw new Exception('Missing required fields');
            }
            
            $contactData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'subject' => $data['subject'] ?? '',
                'message' => $data['message'],
                'phone' => $data['phone'] ?? '',
                'message_type' => $data['message_type'] ?? 'general'
            ];
            
            $messageId = $this->db->insert('contact_messages', $contactData);
            
            echo json_encode(['success' => true, 'message_id' => $messageId]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
    
    // Statistics API
    public function getStatistics() {
        try {
            $stats = [];
            
            // Faculty count
            $stats['faculty_count'] = $this->db->fetch("SELECT COUNT(*) as count FROM faculty WHERE is_active = 1")['count'];
            
            // Programs count
            $stats['programs_count'] = $this->db->fetch("SELECT COUNT(*) as count FROM programs")['count'];
            
            // Research areas count
            $stats['research_areas_count'] = $this->db->fetch("SELECT COUNT(*) as count FROM research_areas")['count'];
            
            // Upcoming events count
            $stats['upcoming_events_count'] = $this->db->fetch("SELECT COUNT(*) as count FROM events WHERE start_date >= NOW()")['count'];
            
            // Recent news count
            $stats['recent_news_count'] = $this->db->fetch("SELECT COUNT(*) as count FROM news WHERE publish_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)")['count'];
            
            echo json_encode(['success' => true, 'data' => $stats]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}

// Route requests
$api = new APIController();
$endpoint = $_GET['endpoint'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($endpoint) {
    case 'faculty':
        $api->getFaculty();
        break;
        
    case 'news':
        $limit = $_GET['limit'] ?? 10;
        $api->getNews($limit);
        break;
        
    case 'events':
        $limit = $_GET['limit'] ?? 10;
        $api->getEvents($limit);
        break;
        
    case 'programs':
        $api->getPrograms();
        break;
        
    case 'research-areas':
        $api->getResearchAreas();
        break;
        
    case 'outreach':
        $api->getOutreachActivities();
        break;
        
    case 'contact':
        if ($method === 'POST') {
            $api->submitContact();
        }
        break;
        
    case 'statistics':
        $api->getStatistics();
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid endpoint']);
        break;
}
?>
