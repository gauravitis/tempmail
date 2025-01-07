import { getCurrentProvider, switchToNextProvider } from './providers';
import { ApiError } from './errors';

async function tryWithFallback<T>(operation: (provider: ReturnType<typeof getCurrentProvider>) => Promise<T>): Promise<T> {
  const maxAttempts = 2; // Try current provider and one fallback
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation(getCurrentProvider());
    } catch (error) {
      lastError = error as Error;
      switchToNextProvider();
    }
  }

  throw lastError || new ApiError('All providers failed');
}

export async function getDomains() {
  return tryWithFallback(provider => provider.getDomain());
}

export async function createAccount(address: string, password: string) {
  return tryWithFallback(provider => provider.createAccount(address, password));
}

export async function getToken(address: string, password: string) {
  return tryWithFallback(provider => provider.getToken(address, password));
}

export async function getMessages(token: string) {
  return getCurrentProvider().getMessages(token);
}

export async function getMessage(id: string, token: string) {
  return getCurrentProvider().getMessage(id, token);
}

export function getActiveProvider() {
  return getCurrentProvider().name;
}