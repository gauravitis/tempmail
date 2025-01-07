import { Email } from '../../types/email';

// In-memory storage
const emails = new Map<string, Email[]>();
const accounts = new Map<string, string>();

export const localEmailServer = {
  name: 'local',
  
  async getDomain(): Promise<string> {
    return 'local.mail';
  },

  async createAccount(address: string, password: string): Promise<void> {
    accounts.set(address, password);
    emails.set(address, []);
    return Promise.resolve();
  },

  async getToken(address: string, password: string): Promise<{ token: string }> {
    const storedPassword = accounts.get(address);
    if (!storedPassword || storedPassword !== password) {
      throw new Error('Invalid credentials');
    }
    return { token: address }; // Use email as token for simplicity
  },

  async getMessages(token: string): Promise<Email[]> {
    return emails.get(token) || [];
  },

  // Method to simulate receiving an email (for testing)
  async simulateIncomingEmail(to: string, from: string, subject: string, body: string): Promise<void> {
    const userEmails = emails.get(to) || [];
    const newEmail: Email = {
      id: Math.random().toString(36).substring(7),
      from,
      subject,
      body,
      receivedAt: new Date().toISOString()
    };
    userEmails.push(newEmail);
    emails.set(to, userEmails);
  }
};