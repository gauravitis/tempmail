import { Mail } from 'lucide-react';
import { Email } from '../types/email';

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  selectedEmailId?: string;
}

export function EmailList({ emails, onSelectEmail, selectedEmailId }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Mail className="w-12 h-12 mb-2" />
        <p>No emails yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedEmailId === email.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex justify-between mb-1">
            <span className="font-medium">{email.from}</span>
            <span className="text-sm text-gray-500">
              {new Date(email.receivedAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900">{email.subject}</div>
        </div>
      ))}
    </div>
  );
}