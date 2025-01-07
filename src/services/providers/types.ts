export interface EmailProvider {
  name: string;
  getDomain(): Promise<string>;
  createAccount(address: string, password: string): Promise<any>;
  getToken(address: string, password: string): Promise<{ token: string }>;
  getMessages(token: string): Promise<any>;
  getMessage(id: string, token: string): Promise<any>;
}