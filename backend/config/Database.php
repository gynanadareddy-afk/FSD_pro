<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'cse_department';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    
    public $pdo;
    
    public function __construct() {
        $this->connect();
    }
    
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_PERSISTENT         => true, // Connection pooling
            ];
            
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        }
    }
    
    // Generic query method
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Fetch single record
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    // Fetch multiple records
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    // Insert record
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, array_values($data));
        
        return $this->pdo->lastInsertId();
    }
    
    // Update record
    public function update($table, $data, $where, $whereParams = []) {
        $setClause = [];
        foreach ($data as $key => $value) {
            $setClause[] = "{$key} = ?";
        }
        $setClause = implode(', ', $setClause);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        $params = array_merge(array_values($data), $whereParams);
        
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    // Delete record
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    // Begin transaction
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }
    
    // Commit transaction
    public function commit() {
        return $this->pdo->commit();
    }
    
    // Rollback transaction
    public function rollback() {
        return $this->pdo->rollback();
    }
    
    // Get last insert ID
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
    
    // Close connection
    public function close() {
        $this->pdo = null;
    }
}
?>
