import { User, Message } from '../shared/types';
export declare class DatabaseManager {
    private readonly db;
    constructor();
    /**
     * Initialize database tables
     */
    private initializeTables;
    /**
     * Create or update a user
     */
    createUser(user: User): Promise<void>;
    /**
     * Update user online status
     */
    updateUserStatus(user: User): Promise<void>;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<User | null>;
    /**
     * Save a message
     */
    saveMessage(message: Message): Promise<void>;
    /**
     * Get messages for a user (sent or received)
     */
    getUserMessages(userId: string): Promise<Message[]>;
    /**
     * Get conversation between two users
     */
    getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
    /**
     * Close database connection
     */
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseManager.d.ts.map