// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyChat.jsx (Student Page)                            ║
// ║  PATH: frontend/src/pages/MyChat.jsx                         ║
// ║                                                              ║
// ║  KYA HAI? → Student ka Chat/Messaging page.                 ║
// ║  → Student apni conversations dekhta hai.                   ║
// ║  → Naya conversation start kar sakta hai.                   ║
// ║  → Admin ko message bhej sakta hai.                         ║
// ║  → WhatsApp-style chat interface.                           ║
// ║  → Route: /my-chat (logged in student)                      ║
// ╚══════════════════════════════════════════════════════════════╝
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaComments, FaPaperPlane, FaPlus, FaTimes, FaLock, FaArrowLeft,
  FaUser, FaUserShield,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function MyChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [msgLoading, setMsgLoading]       = useState(false);
  const [replyText, setReplyText]         = useState('');
  const [sending, setSending]             = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [newSubject, setNewSubject]       = useState('');
  const [newText, setNewText]             = useState('');
  const messagesEndRef = useRef(null);

  // ── Fetch my conversations ───────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/messages/my');
      setConversations(data.data || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Open conversation ────────────────────────────────────────
  const openConvo = useCallback(async (id) => {
    try {
      setMsgLoading(true);
      const { data } = await api.get(`/messages/${id}`);
      setActiveConvo(data.data);
      await api.put(`/messages/${id}/read`);
      fetchConversations();
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setMsgLoading(false);
    }
  }, [fetchConversations]);

  // ── Start new conversation ───────────────────────────────────
  const handleNew = async () => {
    if (!newText.trim()) { toast.error('Message is required'); return; }
    try {
      setSending(true);
      const { data } = await api.post('/messages', {
        subject: newSubject || 'General',
        text: newText.trim(),
      });
      toast.success('Conversation started!');
      setShowNew(false);
      setNewSubject('');
      setNewText('');
      setActiveConvo(data.data);
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setSending(false);
    }
  };

  // ── Send reply ───────────────────────────────────────────────
  const handleSend = async () => {
    if (!replyText.trim() || !activeConvo) return;
    try {
      setSending(true);
      const { data } = await api.post(`/messages/${activeConvo._id}/send`, { text: replyText.trim() });
      setActiveConvo(data.data);
      setReplyText('');
      fetchConversations();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0f1f3d] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaComments className="text-gold" /> My Messages
            </h1>
            <p className="text-gray-400 text-sm mt-1">Chat with administration</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-gold hover:bg-gold/80 text-black rounded-xl font-medium text-sm transition-all flex items-center gap-2">
            <FaPlus /> New Message
          </button>
        </div>

        {/* ── Chat Container ── */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>

          {/* LEFT: Conversation List */}
          <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-white/10 text-center text-gray-400 text-xs uppercase tracking-wider">
              Conversations ({conversations.length})
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-gray-500 py-12 px-4">
                  <FaComments className="mx-auto text-3xl mb-2 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Click "New Message" to start</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button key={c._id} onClick={() => openConvo(c._id)}
                    className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all ${
                      activeConvo?._id === c._id ? 'bg-white/10 border-l-2 border-l-gold' : ''
                    }`}>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm truncate">{c.subject || 'General'}</p>
                      <span className="text-gray-500 text-xs flex-shrink-0 ml-2">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {c.status === 'closed' && (
                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Closed</span>
                      )}
                      {c.unreadByStudent > 0 && (
                        <span className="bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {c.unreadByStudent}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Messages */}
          <div className={`flex-1 flex flex-col ${activeConvo ? 'flex' : 'hidden md:flex'}`}>
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaComments className="mx-auto text-5xl mb-3 opacity-20" />
                  <p className="text-lg">Select a conversation</p>
                  <p className="text-sm mt-1">Or start a new one</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                  <button onClick={() => setActiveConvo(null)} className="md:hidden text-gray-400 hover:text-white mr-1">
                    <FaArrowLeft />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-blue-500/20 flex items-center justify-center">
                    <FaUserShield className="text-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Administration</p>
                    <p className="text-gray-400 text-xs">{activeConvo.subject || 'General'}</p>
                  </div>
                  {activeConvo.status === 'closed' && (
                    <span className="ml-auto text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-lg border border-red-500/20">
                      <FaLock className="inline mr-1 text-[10px]" /> Closed
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    </div>
                  ) : (
                    activeConvo.messages?.map((msg, idx) => {
                      const isMe = msg.sender === 'student';
                      return (
                        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMe
                              ? 'bg-gold/20 text-white rounded-br-md'
                              : 'bg-white/10 text-gray-200 rounded-bl-md'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-gold/60 text-right' : 'text-gray-500'}`}>
                              {isMe ? 'You' : 'Admin'} · {fmtTime(msg.sentAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply */}
                {activeConvo.status === 'active' ? (
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex gap-3">
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message… (Enter to send)"
                        rows={2}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-gold/50 placeholder-gray-500" />
                      <button onClick={handleSend} disabled={sending || !replyText.trim()}
                        className="self-end px-5 py-3 bg-gold hover:bg-gold/80 text-black rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                        <FaPaperPlane /> Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-white/10 bg-white/5 text-center text-gray-500 text-sm">
                    <FaLock className="inline mr-1" /> This conversation is closed
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── New Conversation Modal ── */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a2742] border border-white/10 rounded-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaPlus className="text-gold" /> New Conversation
                </h2>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white">
                  <FaTimes />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Subject</label>
                  <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Fee Query, Leave Request…"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/50 placeholder-gray-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Message <span className="text-red-400">*</span></label>
                  <textarea value={newText} onChange={(e) => setNewText(e.target.value)}
                    placeholder="Type your message…" rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-gold/50 placeholder-gray-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-white/10">
                <button onClick={() => setShowNew(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={handleNew} disabled={sending}
                  className="px-5 py-2.5 bg-gold hover:bg-gold/80 text-black rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                  <FaPaperPlane /> {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
