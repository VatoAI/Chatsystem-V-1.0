"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class DatabaseManager {
    constructor() {
        // Create database connection
        this.db = new sqlite3_1.default.Database('./chat.db', (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            }
            else {
                console.log('📁 Connected to SQLite database');
                this.initializeTables();
            }
        });
    }
    /**
     * Initialize database tables
     */
    async initializeTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        public_key TEXT NOT NULL,
        is_online BOOLEAN DEFAULT FALSE,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
            `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        encrypted_content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
      )`,
            `CREATE TABLE IF NOT EXISTS chat_rooms (
        id TEXT PRIMARY KEY,
        name TEXT,
        is_group BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
            `CREATE TABLE IF NOT EXISTS room_participants (
        room_id TEXT,
        user_id TEXT,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id),
        FOREIGN KEY (room_id) REFERENCES chat_rooms (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
        ];
        for (const query of queries) {
            await new Promise((resolve, reject) => {
                this.db.run(query, (err) => {
                    if (err) {
                        console.error('Error creating table:', err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        console.log('✅ Database tables initialized successfully');
    }
    /**
     * Create or update a user
     */
    async createUser(user) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT OR REPLACE INTO users (id, username, public_key, is_online, last_seen) 
         VALUES (?, ?, ?, ?, ?)`, [user.id, user.username, user.publicKey, user.isOnline ? 1 : 0, user.lastSeen.toISOString()], (err) => {
                if (err) {
                    console.error('Error creating user:', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Update user online status
     */
    async updateUserStatus(user) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE users SET is_online = ?, last_seen = ? WHERE id = ?`, [user.isOnline ? 1 : 0, user.lastSeen.toISOString(), user.id], (err) => {
                if (err) {
                    console.error('Error updating user status:', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
                if (err) {
                    console.error('Error getting user:', err);
                    reject(err);
                }
                else if (!row) {
                    resolve(null);
                }
                else {
                    resolve({
                        id: row.id,
                        username: row.username,
                        publicKey: row.public_key,
                        isOnline: Boolean(row.is_online),
                        lastSeen: new Date(row.last_seen)
                    });
                }
            });
        });
    }
    /**
     * Save a message
     */
    async saveMessage(message) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO messages (id, sender_id, receiver_id, encrypted_content, message_type, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?)`, [
                message.id,
                message.senderId,
                message.receiverId,
                message.encryptedContent,
                message.messageType,
                message.timestamp.toISOString()
            ], (err) => {
                if (err) {
                    console.error('Error saving message:', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    /**
     * Get messages for a user (sent or received)
     */
    async getUserMessages(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM messages 
         WHERE sender_id = ? OR receiver_id = ? 
         ORDER BY timestamp ASC`, [userId, userId], (err, rows) => {
                if (err) {
                    console.error('Error getting user messages:', err);
                    reject(err);
                }
                else {
                    const messages = rows.map(row => ({
                        id: row.id,
                        senderId: row.sender_id,
                        receiverId: row.receiver_id,
                        encryptedContent: row.encrypted_content,
                        messageType: row.message_type,
                        timestamp: new Date(row.timestamp)
                    }));
                    resolve(messages);
                }
            });
        });
    }
    /**
     * Get conversation between two users
     */
    async getConversation(user1Id, user2Id) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM messages 
         WHERE (sender_id = ? AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = ?)
         ORDER BY timestamp ASC`, [user1Id, user2Id, user2Id, user1Id], (err, rows) => {
                if (err) {
                    console.error('Error getting conversation:', err);
                    reject(err);
                }
                else {
                    const messages = rows.map(row => ({
                        id: row.id,
                        senderId: row.sender_id,
                        receiverId: row.receiver_id,
                        encryptedContent: row.encrypted_content,
                        messageType: row.message_type,
                        timestamp: new Date(row.timestamp)
                    }));
                    resolve(messages);
                }
            });
        });
    }
    /**
     * Close database connection
     */
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    reject(err);
                }
                else {
                    console.log('📁 Database connection closed');
                    resolve();
                }
            });
        });
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map