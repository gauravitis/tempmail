import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

interface EmailBoxProps {
  email: string;
  onRefresh: () => void;
}

export function EmailBox({ email, onRefresh }: EmailBoxProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your temporary email address
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 block w-full p-3 input-field rounded-lg font-mono text-lg text-blue-700 break-all">
              {email}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-3 text-gray-600 hover:text-blue-600 input-field rounded-lg 
                       transition-all duration-300 hover:bg-blue-50"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 
                               bg-gray-800 text-white text-xs rounded-md shadow-lg">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="button-gradient rounded-lg px-4 py-3 flex items-center justify-center gap-2 shadow-md"
        >
          <RefreshCw className="w-5 h-5" />
          <span>New Address</span>
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Emails sent to this address will appear automatically below
      </p>
    </div>
  );
}