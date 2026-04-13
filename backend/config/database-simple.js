const mongoose = require('mongoose');
require('dotenv').config();

class Database {
    constructor() {
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cse-department';
        this.options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        this.isConnected = false;
    }

    async connect() {
        try {
            await mongoose.connect(this.mongoUri, this.options);
            this.isConnected = true;
            console.log('Connected to persistent MongoDB successfully');
            return true;
        } catch (error) {
            console.warn('Failed to connect to persistent MongoDB, using in-memory collection simulation');
            console.warn('Persistent MongoDB error:', error.message);
            
            this.isConnected = false;
            console.log('Using in-memory data simulation (data will be lost on restart)');
            return true;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {
                await mongoose.disconnect();
                console.log('Disconnected from MongoDB');
            } else {
                console.log('In-memory simulation stopped');
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
        }
    }

    getConnectionState() {
        if (this.isConnected) {
            const states = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };
            return states[mongoose.connection.readyState] || 'unknown';
        }
        return 'in-memory-simulation';
    }

    async healthCheck() {
        try {
            if (this.isConnected) {
                const state = this.getConnectionState();
                if (state === 'connected') {
                    await mongoose.connection.db.admin().ping();
                    return { status: 'healthy', state, type: 'persistent' };
                }
                return { status: 'unhealthy', state, type: 'persistent' };
            } else {
                return { status: 'healthy', state: 'in-memory-simulation', type: 'memory' };
            }
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    isPersistent() {
        return this.isConnected;
    }
}

module.exports = new Database();
