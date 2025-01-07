export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}

export interface EmailAccount {
  address: string;
  password: string;
}