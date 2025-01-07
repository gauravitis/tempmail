import React, { useEffect, useState, useCallback } from 'react';
import { Inbox, Trash2 } from 'lucide-react';
import { EmailBox } from './components/EmailBox';
import { EmailList } from './components/EmailList';
import { EmailViewer } from './components/EmailViewer';
import { Email, EmailAccount } from './types/email';
import { ApiError } from './services/errors';
import { fetchEmails } from './services/email/fetchEmails';
import * as api from './services/api';

// Constants for localStorage keys
const STORAGE_KEYS = {
  ACCOUNTS: 'temp_mail_accounts',
  EMAILS: 'temp_mail_emails',
  SELECTED_ACCOUNT: 'temp_mail_selected_account'
};

interface StoredAccount extends EmailAccount {
  lastUsed: number;
  token: string;
}

function App() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [token, setToken] = useState<string>('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([]);

  // Load saved data on initial mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedAccountsStr = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        const savedAccounts: StoredAccount[] = savedAccountsStr ? JSON.parse(savedAccountsStr) : [];
        setSavedAccounts(savedAccounts);

        const selectedAccountStr = localStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT);
        if (selectedAccountStr) {
          const selectedAccount: StoredAccount = JSON.parse(selectedAccountStr);
          setAccount({ address: selectedAccount.address, password: selectedAccount.password });
          setToken(selectedAccount.token);

          const savedEmailsStr = localStorage.getItem(STORAGE_KEYS.EMAILS);
          if (savedEmailsStr) {
            setEmails(JSON.parse(savedEmailsStr));
          }
        } else if (!account) {
          createNewAccount();
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save accounts whenever they change
  useEffect(() => {
    if (savedAccounts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(savedAccounts));
    }
  }, [savedAccounts]);

  // Save emails whenever they change
  useEffect(() => {
    if (emails.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(emails));
    }
  }, [emails]);

  // Save selected account whenever it changes
  useEffect(() => {
    if (account && token) {
      const currentAccount: StoredAccount = {
        ...account,
        token,
        lastUsed: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, JSON.stringify(currentAccount));
      
      // Update or add to saved accounts
      setSavedAccounts(prev => {
        const existing = prev.findIndex(a => a.address === account.address);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = currentAccount;
          return updated;
        }
        return [...prev, currentAccount].slice(-5); // Keep last 5 accounts
      });
    }
  }, [account, token]);

  const createNewAccount = async () => {
    try {
      setLoading(true);
      setError('');
      
      const domain = await api.getDomains();
      const randomString = Math.random().toString(36).substring(7);
      const address = `${randomString}@${domain}`;
      const password = Math.random().toString(36).substring(7);

      await api.createAccount(address, password);
      const tokenResponse = await api.getToken(address, password);
      
      setAccount({ address, password });
      setToken(tokenResponse.token);
      setSelectedEmail(null);
      setEmails([]);
    } catch (error) {
      console.error('Error creating account:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Unable to create email account. Please try again.';
      setError(errorMessage);
      setAccount(null);
      setToken('');
    } finally {
      setLoading(false);
    }
  };

  const switchAccount = (storedAccount: StoredAccount) => {
    setAccount({ address: storedAccount.address, password: storedAccount.password });
    setToken(storedAccount.token);
    setSelectedEmail(null);
    const savedEmailsStr = localStorage.getItem(`${STORAGE_KEYS.EMAILS}_${storedAccount.address}`);
    setEmails(savedEmailsStr ? JSON.parse(savedEmailsStr) : []);
  };

  const deleteAccount = (addressToDelete: string) => {
    setSavedAccounts(prev => prev.filter(a => a.address !== addressToDelete));
    if (account?.address === addressToDelete) {
      setAccount(null);
      setToken('');
      setEmails([]);
      setSelectedEmail(null);
    }
  };

  const fetchEmailsWithRetry = useCallback(async () => {
    if (!token) return;
    
    try {
      const newEmails = await fetchEmails(token);
      setEmails(prev => {
        const combined = [...prev, ...newEmails.filter(
          newEmail => !prev.some(existing => existing.id === newEmail.id)
        )];
        // Save to localStorage
        if (account) {
          localStorage.setItem(
            `${STORAGE_KEYS.EMAILS}_${account.address}`, 
            JSON.stringify(combined)
          );
        }
        return combined;
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      if (error instanceof ApiError) {
        createNewAccount();
      }
    }
  }, [token, account]);

  useEffect(() => {
    if (token) {
      fetchEmailsWithRetry();
      const interval = setInterval(fetchEmailsWithRetry, 5000);
      return () => clearInterval(interval);
    }
  }, [token, fetchEmailsWithRetry]);

  return (
    <div className="gradient-bg">
      <header className="glass-effect shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-white rounded-xl shadow-md">
                <Inbox className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Temporary Email
              </h1>
            </div>
            {savedAccounts.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  className="input-field rounded-lg px-3 py-2 text-sm"
                  value={account?.address || ''}
                  onChange={(e) => {
                    const selected = savedAccounts.find(a => a.address === e.target.value);
                    if (selected) switchAccount(selected);
                  }}
                >
                  <option value="">Select Account</option>
                  {savedAccounts.map(acc => (
                    <option key={acc.address} value={acc.address}>
                      {acc.address} ({new Date(acc.lastUsed).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {account && (
                  <button
                    onClick={() => account && deleteAccount(account.address)}
                    className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete current account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          {error && (
            <div className="mb-6 glass-effect p-4 border-2 border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-medium">{error}</span>
                <button 
                  onClick={createNewAccount}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg 
                           transition-colors duration-300 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
          
          {account ? (
            <div className="glass-effect rounded-xl hover-scale">
              <div className="p-6">
                <EmailBox 
                  email={account.address} 
                  onRefresh={createNewAccount}
                />
              </div>
            </div>
          ) : (
            <div className="text-center glass-effect rounded-xl p-8">
              {loading && (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-lg text-gray-700 font-medium">Creating your temporary email...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-effect rounded-xl overflow-hidden hover-scale">
            <div className="gradient-header p-4">
              <h2 className="text-lg">Inbox</h2>
            </div>
            <EmailList
              emails={emails}
              onSelectEmail={setSelectedEmail}
              selectedEmailId={selectedEmail?.id}
            />
          </div>

          <div className="glass-effect rounded-xl overflow-hidden hover-scale">
            {selectedEmail ? (
              <EmailViewer email={selectedEmail} />
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Inbox className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">Select an email to view its contents</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;