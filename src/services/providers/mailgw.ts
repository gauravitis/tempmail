import { fetchWithRetry } from '../http';
import { ApiError } from '../errors';
import { EmailProvider } from './types';
import { API_CONFIG } from '../config';

const BASE_URL = API_CONFIG.BASE_URL;

export const MailGwProvider: EmailProvider = {
  name: 'mail.gw',
  
  async getDomain() {
    try {
      const data = await fetchWithRetry(`${BASE_URL}/domains`);
      if (!data.hydra_member?.length) {
        throw new ApiError('No available domains found');
      }
      return data.hydra_member[0].domain;
    } catch (error) {
      if (error instanceof ApiError && error.status === 500) {
        throw new ApiError('Mail.gw service is temporarily unavailable');
      }
      throw error;
    }
  },

  async createAccount(address: string, password: string) {
    try {
      return await fetchWithRetry(`${BASE_URL}/accounts`, {
        method: 'POST',
        body: JSON.stringify({ address, password }),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          throw new ApiError('Email address already taken');
        } else if (error.status === 500) {
          throw new ApiError('Unable to create account. Service temporarily unavailable');
        }
      }
      throw error;
    }
  },

  async getToken(address: string, password: string) {
    try {
      return await fetchWithRetry(`${BASE_URL}/token`, {
        method: 'POST',
        body: JSON.stringify({ address, password }),
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new ApiError('Invalid credentials');
      }
      throw error;
    }
  },

  async getMessages(token: string) {
    return fetchWithRetry(`${BASE_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getMessage(id: string, token: string) {
    return fetchWithRetry(`${BASE_URL}/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};