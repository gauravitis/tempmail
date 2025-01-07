import { Email } from '../types/email';

interface EmailViewerProps {
  email: Email;
}

export function EmailViewer({ email }: EmailViewerProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{email.subject}</h2>
        <div className="text-sm text-gray-600 mb-2">
          From: <span className="font-medium">{email.from}</span>
        </div>
        <div className="text-sm text-gray-600">
          Received: {new Date(email.receivedAt).toLocaleString()}
        </div>
      </div>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: email.body }}
      />
    </div>
  );
}