import { Email } from '../../types/email';
import { getCurrentProvider } from '../providers';

export async function fetchEmails(token: string): Promise<Email[]> {
  try {
    return await getCurrentProvider().getMessages(token);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}