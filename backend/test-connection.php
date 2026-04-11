<?php
// Test database connection
$host = 'localhost';
$db_name = 'cse_department';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n";
    
    // Test tables
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "📊 Tables created: " . implode(', ', $tables) . "\n";
    
    // Test sample data
    $faculty_count = $pdo->query("SELECT COUNT(*) FROM faculty")->fetchColumn();
    echo "👥 Faculty records: $faculty_count\n";
    
    $programs_count = $pdo->query("SELECT COUNT(*) FROM programs")->fetchColumn();
    echo "📚 Programs: $programs_count\n";
    
    echo "\n🎉 Database is ready for your project!\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
