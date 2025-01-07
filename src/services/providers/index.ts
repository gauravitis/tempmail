import { SecMailProvider } from './secmail';
import { EmailProvider } from './types';

const providers: EmailProvider[] = [
  SecMailProvider,
];

export function getCurrentProvider(): EmailProvider {
  return providers[0];
}

export function switchToNextProvider(): EmailProvider {
  return getCurrentProvider();
}

export function getProviderName(): string {
  return getCurrentProvider().name;
}