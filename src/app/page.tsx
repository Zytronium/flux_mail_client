'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Settings, 
  Plus, 
  Inbox, 
  Trash2, 
  Shield, 
  FileText,
  AlertCircle,
  ChevronRight,
  Loader2,
  Cpu,
  Zap,
  Archive,
  Edit,
  X as XIcon
} from 'lucide-react';
import { EmailAccount, EmailMessage } from '@/types/electron';

const FOLDERS = [
  { key: 'inbox', label: 'INBOX', icon: Inbox },
  { key: 'sent', label: 'SENT', icon: Send },
  { key: 'drafts', label: 'DRAFTS', icon: FileText },
  { key: 'spam', label: 'JUNK', icon: AlertCircle },
  { key: 'trash', label: 'TRASH', icon: Trash2 },
];

export default function Home() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<EmailAccount | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);

  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    text: ''
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    user: '',
    pass: '',
    host: 'imap.gmail.com',
    port: '993',
    secure: true,
    label: ''
  });

  // Load accounts on mount
  useEffect(() => {
    loadSavedAccounts();
  }, []);

  const loadSavedAccounts = async () => {
    try {
      const savedAccounts = await window.electron.loadAccounts();
      if (savedAccounts && savedAccounts.length > 0) {
        setAccounts(savedAccounts);
        setActiveAccount(savedAccounts[0]);
        fetchEmails(savedAccounts[0], activeFolder);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const saveAccountsToStorage = async (accountsToSave: EmailAccount[]) => {
    try {
      await window.electron.saveAccounts(accountsToSave);
    } catch (err) {
      console.error('Failed to save accounts:', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;
    setLoading(true);
    try {
        const result = await window.electron.sendEmail(activeAccount, composeData);
        if (result.success) {
            setShowCompose(false);
            setComposeData({ to: '', subject: '', text: '' });
        alert('✓ TRANSMISSION_SUCCESSFUL');
        } else {
        alert('✗ TRANSMISSION_FAILED: ' + result.error);
        }
    } catch (err) {
        console.error(err);
      alert('✗ CRITICAL_ERROR');
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        user: loginData.user,
        pass: loginData.pass,
        host: loginData.host,
        port: parseInt(loginData.port),
        secure: loginData.secure
      };
      
      const result = await window.electron.login(config);
      if (result.success) {
        const newAccount: EmailAccount = {
          ...config,
          id: Math.random().toString(36).substr(2, 9),
          label: loginData.label || loginData.user
        };
        const updatedAccounts = [...accounts, newAccount];
        setAccounts(updatedAccounts);
        setActiveAccount(newAccount);
        setShowLogin(false);
        setLoginData({ user: '', pass: '', host: 'imap.gmail.com', port: '993', secure: true, label: '' });
        await saveAccountsToStorage(updatedAccounts);
        fetchEmails(newAccount, activeFolder);
      } else {
        alert('CONNECTION_FAILED: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('✗ AUTHENTICATION_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setLoading(true);
    try {
      // Test the connection first
      const config = {
        user: loginData.user,
        pass: loginData.pass,
        host: loginData.host,
        port: parseInt(loginData.port),
        secure: loginData.secure
      };

      const result = await window.electron.login(config);
      if (result.success) {
        const updatedAccount: EmailAccount = {
          ...config,
          id: editingAccount.id,
          label: loginData.label || loginData.user
        };

        const updatedAccounts = accounts.map(acc =>
          acc.id === editingAccount.id ? updatedAccount : acc
        );

        setAccounts(updatedAccounts);
        if (activeAccount?.id === editingAccount.id) {
          setActiveAccount(updatedAccount);
        }

        await saveAccountsToStorage(updatedAccounts);
        setShowAccountManager(false);
        setEditingAccount(null);
        setLoginData({ user: '', pass: '', host: 'imap.gmail.com', port: '993', secure: true, label: '' });
      } else {
        alert('CONNECTION_FAILED: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('✗ UPDATE_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Remove this account? This cannot be undone.')) return;

    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);

    if (activeAccount?.id === accountId) {
      setActiveAccount(updatedAccounts[0] || null);
      setEmails([]);
      setSelectedEmail(null);
    }

    await saveAccountsToStorage(updatedAccounts);
  };

  const startEditAccount = (account: EmailAccount) => {
    setEditingAccount(account);
    setLoginData({
      user: account.user,
      pass: account.pass,
      host: account.host,
      port: account.port.toString(),
      secure: account.secure,
      label: account.label
    });
    setShowAccountManager(false);
    setShowLogin(true);
  };

  const fetchEmails = async (account: EmailAccount, folder: string = 'inbox') => {
    setLoading(true);
    setEmails([]);
    setSelectedEmail(null);

    try {
      console.log('Fetching from folder:', folder);
      const result = await window.electron.fetchEmails({
        user: account.user,
        pass: account.pass,
        host: account.host,
        port: account.port,
        secure: account.secure
      }, folder);

      console.log('Fetch result:', result);

      if (result.success) {
        setEmails(result.messages || []);
      } else {
        console.error('Fetch failed:', result.error);
        alert(`FETCH_ERROR [${folder}]: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Fetch exception:', err);
      alert('✗ DATA_STREAM_INTERRUPTED');
    } finally {
      setLoading(false);
    }
  };

  const switchFolder = (folder: string) => {
    setActiveFolder(folder);
    if (activeAccount) {
      fetchEmails(activeAccount, folder);
    }
  };

  return (
    <main className="flex h-screen w-screen text-foreground overflow-hidden font-mono selection:bg-neon-blue selection:text-black">
      {/* Sidebar */}
      <nav className="w-64 glass-panel border-r border-white/10 flex flex-col items-center py-8 z-20">
        <div className="mb-12 relative">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-2 border-dashed border-neon-blue flex items-center justify-center"
            >
                <Cpu className="text-neon-blue w-8 h-8 glowing-text" />
            </motion.div>
            <div className="absolute -inset-2 bg-neon-blue/20 blur-xl rounded-full -z-10 animate-pulse-glow" />
            <h1 className="mt-4 text-xs tracking-[0.3em] font-bold text-neon-blue text-center glowing-text text-[10px]">FLUX_MAIL</h1>
        </div>

        <div className="flex-1 w-full px-4 space-y-4">
          <button 
            onClick={() => {
              setEditingAccount(null);
              setLoginData({ user: '', pass: '', host: 'imap.gmail.com', port: '993', secure: true, label: '' });
              setShowLogin(true);
            }}
            className="w-full py-2 px-4 rounded border border-neon-blue/50 text-neon-blue text-[10px] hover:bg-neon-blue/10 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            ADD_NODE
          </button>

          <button 
            disabled={!activeAccount}
            onClick={() => setShowCompose(true)}
            className="w-full py-2 px-4 rounded border border-neon-purple/50 text-neon-purple text-[10px] hover:bg-neon-purple/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            NEW_TRANSMISSION
          </button>

          {/* Folders */}
          <div className="pt-4 space-y-2">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Data_Streams</p>
            {FOLDERS.map(folder => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.key}
                  disabled={!activeAccount}
                  onClick={() => switchFolder(folder.key)}
                  className={`w-full text-left p-3 rounded text-[10px] flex items-center gap-2 group transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    activeFolder === folder.key && activeAccount
                      ? 'bg-neon-blue/20 border-l-2 border-neon-blue text-neon-blue'
                      : 'hover:bg-white/5 text-white/70'
                  }`}
                >
                  <Icon size={12} />
                  <span className="flex-1">{folder.label}</span>
                  {activeFolder === folder.key && <ChevronRight size={12} />}
                </button>
              );
            })}
          </div>

          {/* Accounts */}
          <div className="pt-6 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Network_Nodes</p>
              <button
                onClick={() => setShowAccountManager(true)}
                className="text-white/40 hover:text-neon-blue transition-colors"
                title="Manage accounts"
              >
                <Settings size={12} />
              </button>
            </div>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => {
                    setActiveAccount(acc);
                  fetchEmails(acc, activeFolder);
                }}
                className={`w-full text-left p-3 rounded text-[10px] flex items-center justify-between group transition-all ${
                  activeAccount?.id === acc.id
                    ? 'bg-neon-purple/20 border-l-2 border-neon-purple'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="truncate">{acc.label}</span>
                <ChevronRight size={12} className={activeAccount?.id === acc.id ? 'text-neon-purple' : 'opacity-0 group-hover:opacity-100'} />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 w-full">
            <div className="p-3 glass-panel rounded-lg border border-white/5 text-[10px] text-white/50 space-y-1">
                <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-neon-blue animate-pulse">ENCRYPTED</span>
                </div>
                <div className="flex justify-between">
              <span>FOLDER:</span>
              <span className="uppercase">{activeFolder}</span>
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <section className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div className="w-2/5 border-r border-white/10 flex flex-col">
          <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Archive size={16} className="text-neon-purple" />
              <h2 className="text-[10px] tracking-widest text-white/80 uppercase">
                {FOLDERS.find(f => f.key === activeFolder)?.label || activeFolder}
              </h2>
            </div>
            <div className="text-[9px] text-white/40">
              {emails.length} PACKETS
            </div>
        </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-neon-blue w-10 h-10" />
                <p className="text-[10px] text-neon-blue tracking-wider animate-pulse uppercase">Decrypting Stream...</p>
                    </div>
                )}
                
                {!loading && emails.length === 0 && !activeAccount && (
                    <div className="text-center py-20">
                        <Zap className="mx-auto text-white/10 w-16 h-16 mb-6" />
                <p className="text-[10px] text-white/30 italic tracking-wider">AWAITING_CONNECTION</p>
              </div>
            )}

            {!loading && emails.length === 0 && activeAccount && (
              <div className="text-center py-20">
                <Archive className="mx-auto text-white/10 w-16 h-16 mb-6" />
                <p className="text-[10px] text-white/30 italic tracking-wider">NO_DATA_IN_STREAM</p>
                    </div>
                )}

            <AnimatePresence mode="popLayout">
                    {emails.map((email, idx) => (
                        <motion.div
                            key={email.uid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedEmail(email)}
                  className={`glass-panel p-4 rounded-lg border cursor-pointer group transition-all ${
                    selectedEmail?.uid === email.uid
                      ? 'border-neon-blue/50 bg-neon-blue/5'
                      : 'border-white/5 hover:border-neon-blue/30'
                  }`}
                        >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-neon-purple group-hover:bg-neon-purple/20 group-hover:text-white transition-all flex-shrink-0">
                      <Mail size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] text-neon-blue font-bold tracking-wider uppercase truncate">
                          {email.from}
                        </span>
                        <span className="text-[8px] text-white/30 ml-2 flex-shrink-0">
                          {new Date(email.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xs text-white/90 truncate group-hover:text-neon-blue transition-colors">
                        {email.subject}
                      </h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

        {/* Email Preview */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <Mail size={18} className="text-neon-blue" />
              <h2 className="text-xs tracking-widest text-white/80">MESSAGE_VIEWER</h2>
            </div>
            <Settings size={18} className="text-white/40 hover:text-white cursor-pointer transition-colors" />
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            {selectedEmail ? (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-neon-blue glowing-text">
                  {selectedEmail.subject}
                </h2>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-sm text-white/60 mb-1">FROM:</p>
                    <p className="text-sm text-neon-purple">{selectedEmail.from}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60 mb-1">TIMESTAMP:</p>
                    <p className="text-xs text-white/40">
                      {new Date(selectedEmail.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
                  className="prose prose-invert max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.htmlBody || selectedEmail.textBody?.replace(/\n/g, '<br>') || '<i>No content</i>'
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="mx-auto text-white/10 w-20 h-20 mb-6" />
                  <p className="text-sm text-white/30 italic">SELECT_MESSAGE_TO_VIEW</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Account Manager Modal */}
      <AnimatePresence>
        {showAccountManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAccountManager(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-8 rounded-2xl border border-neon-blue/40 shadow-[0_0_50px_rgba(0,242,255,0.1)] max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-neon-blue tracking-widest glowing-text uppercase">
                  ACCOUNT_MANAGEMENT
                </h2>
                <button onClick={() => setShowAccountManager(false)} className="text-white/40 hover:text-white transition-colors">
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {accounts.map(account => (
                  <div key={account.id} className="glass-panel p-4 rounded-lg border border-white/10 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-neon-blue mb-1">{account.label}</h3>
                      <p className="text-xs text-white/60">{account.user}</p>
                      <p className="text-[10px] text-white/40">{account.host}:{account.port}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditAccount(account)}
                        className="p-2 rounded border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 transition-all"
                        title="Edit account"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveAccount(account.id)}
                        className="p-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {accounts.length === 0 && (
                  <div className="text-center py-12 text-white/30 text-sm italic">
                    NO_ACCOUNTS_CONFIGURED
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login/Edit Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {
              setShowLogin(false);
              setEditingAccount(null);
            }} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 rounded-2xl border border-neon-blue/40 shadow-[0_0_50px_rgba(0,242,255,0.1)]"
            >
              <h2 className="text-xl font-bold text-neon-blue mb-8 tracking-widest text-center glowing-text uppercase">
                {editingAccount ? 'MODIFY_NODE' : 'ESTABLISH_NEW_NODE'}
              </h2>
              
              <form onSubmit={editingAccount ? handleEditAccount : handleLogin} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase ml-1">Node_Label</label>
                  <input 
                    type="text" 
                    placeholder="ACCOUNT_ALIAS"
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-neon-blue/50 outline-none transition-all"
                    value={loginData.label}
                    onChange={e => setLoginData({...loginData, label: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase ml-1">IMAP_User</label>
                  <input 
                    type="email" 
                    placeholder="ID@NETWORK.COM"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-neon-blue/50 outline-none transition-all"
                    value={loginData.user}
                    onChange={e => setLoginData({...loginData, user: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase ml-1">Access_Key</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-neon-blue/50 outline-none transition-all"
                    value={loginData.pass}
                    onChange={e => setLoginData({...loginData, pass: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase ml-1">HOST</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs focus:border-neon-blue/50 outline-none"
                            value={loginData.host}
                            onChange={e => setLoginData({...loginData, host: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-white/50 uppercase ml-1">PORT</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs focus:border-neon-blue/50 outline-none"
                            value={loginData.port}
                            onChange={e => setLoginData({...loginData, port: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-neon-blue/10 border border-neon-blue/50 text-neon-blue rounded font-bold text-sm tracking-widest hover:bg-neon-blue/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                  {editingAccount ? 'UPDATE_CONNECTION' : 'INITIATE_CONNECTION'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCompose(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-8 rounded-2xl border border-neon-purple/40 shadow-[0_0_50px_rgba(188,19,254,0.1)]"
            >
              <h2 className="text-xl font-bold text-neon-purple mb-8 tracking-widest text-center glowing-text uppercase">
                INITIATE_OUTBOUND_TRANSMISSION
              </h2>
              
              <form onSubmit={handleSend} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase ml-1">Destination_Node</label>
                  <input 
                    type="email" 
                    placeholder="TARGET@NETWORK.COM"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-neon-purple/50 outline-none transition-all"
                    value={composeData.to}
                    onChange={e => setComposeData({...composeData, to: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase ml-1">Subject_Line</label>
                  <input 
                    type="text" 
                    placeholder="ENCRYPTED_TOPIC"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-neon-purple/50 outline-none transition-all"
                    value={composeData.subject}
                    onChange={e => setComposeData({...composeData, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase ml-1">Data_Payload</label>
                  <textarea 
                    rows={8}
                    placeholder="ENTER_MESSAGE_BODY..."
                    required
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm focus:border-neon-purple/50 outline-none transition-all resize-none"
                    value={composeData.text}
                    onChange={e => setComposeData({...composeData, text: e.target.value})}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setComposeData({ to: '', subject: '', text: '' });
                    }}
                    className="flex-1 py-3 bg-black/40 border border-white/10 text-white rounded font-medium text-sm tracking-widest hover:bg-white/5 transition-all"
                  >
                    RESET
                  </button>

                <button
                  type="submit"
                  disabled={loading}
                    className="flex-2 w-full py-3 bg-neon-purple/10 border border-neon-purple/50 text-neon-purple rounded font-bold text-sm tracking-widest hover:bg-neon-purple/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  EXECUTE_TRANSMISSION
                </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
