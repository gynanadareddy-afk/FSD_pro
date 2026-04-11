<?php
/**
 * Database Setup Script for CSE Department Website
 * Run this script once to set up the database with all tables and sample data
 */

// Database configuration
$host = 'localhost';
$db_name = 'cse_department';
$username = 'root';
$password = '';

try {
    // Connect to MySQL (without selecting database first)
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database '$db_name' created successfully or already exists.\n";
    
    // Select the database
    $pdo->exec("USE $db_name");
    
    // Read and execute the schema file
    $schemaFile = __DIR__ . '/schema.sql';
    if (file_exists($schemaFile)) {
        $schema = file_get_contents($schemaFile);
        
        // Split the schema into individual statements
        $statements = array_filter(array_map('trim', explode(';', $schema)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                try {
                    $pdo->exec($statement);
                } catch (PDOException $e) {
                    echo "Error executing statement: " . $e->getMessage() . "\n";
                    echo "Statement: " . substr($statement, 0, 100) . "...\n";
                }
            }
        }
        
        echo "Database schema and sample data imported successfully!\n";
    } else {
        echo "Schema file not found: $schemaFile\n";
    }
    
    // Verify tables were created
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "\nCreated tables: " . implode(', ', $tables) . "\n";
    
    // Show table statistics
    echo "\nTable Statistics:\n";
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "- $table: $count records\n";
    }
    
    echo "\nDatabase setup completed successfully!\n";
    echo "You can now use the API endpoints to access the data.\n";
    
} catch (PDOException $e) {
    echo "Database setup failed: " . $e->getMessage() . "\n";
    echo "Please check your database credentials and permissions.\n";
}
?>
