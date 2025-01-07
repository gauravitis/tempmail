import { fetchWithRetry } from '../http';
import { EmailProvider } from './types';

const BASE_URL = 'https://www.1secmail.com/api/v1';

export const SecMailProvider: EmailProvider = {
  name: '1secmail',
  
  async getDomain() {
    const domains = ['1secmail.com', '1secmail.org', '1secmail.net'];
    return domains[Math.floor(Math.random() * domains.length)];
  },

  async createAccount() {
    return Promise.resolve({});
  },

  async getToken(address) {
    return Promise.resolve({ token: address });
  },

  async getMessages(token: string) {
    try {
      const [login, domain] = token.split('@');
      if (!login || !domain) {
        return [];
      }

      const url = `${BASE_URL}/?action=getMessages&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map(msg => ({
        id: String(msg.id),
        from: msg.from || 'Unknown Sender',
        subject: msg.subject || 'No Subject',
        body: '',
        receivedAt: new Date(msg.date || Date.now()).toISOString()
      }));
    } catch (error) {
      console.error('1secmail API error:', error);
      return [];
    }
  },

  async getMessage(id: string, token: string) {
    try {
      const [login, domain] = token.split('@');
      if (!login || !domain) {
        return { body: 'Invalid email format' };
      }

      const url = `${BASE_URL}/?action=readMessage&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}&id=${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        body: data.htmlBody || data.textBody || ''
      };
    } catch (error) {
      console.error('Error fetching message:', error);
      return { body: 'Error loading message content' };
    }
  }
};