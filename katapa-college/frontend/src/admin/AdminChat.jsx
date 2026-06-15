// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: AdminChat.jsx (Admin Page)                           ║
// ║  PATH: frontend/src/admin/AdminChat.jsx                      ║
// ║                                                              ║
// ║  KYA HAI? → Admin Chat / Messaging page.                    ║
// ║  → Left panel: conversation list (students).                ║
// ║  → Right panel: message thread + reply box.                 ║
// ║  → Admin can reply, close conversations, mark read.         ║
// ║  → WhatsApp-style chat interface.                           ║
// ║  → Route: /admin/chat (admin only)                          ║
// ╚══════════════════════════════════════════════════════════════╝
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaComments, FaSearch, FaPaperPlane, FaTimes, FaCircle,
  FaEnvelope, FaEnvelopeOpen, FaLock, FaArrowLeft, FaUser,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

// ── helpers ────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const fmtDateTime = (d) => `${fmtDate(d)} ${fmtTime(d)}`;
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

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo]     = useState(null); // full conversation with messages
  const [loading, setLoading]             = useState(true);
  const [msgLoading, setMsgLoading]       = useState(false);
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [replyText, setReplyText]         = useState('');
  const [sending, setSending]             = useState(false);
  const messagesEndRef = useRef(null);

  // ── Fetch conversations ──────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/messages${q}`);
      setConversations(data.data || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Open a conversation ──────────────────────────────────────
  const openConvo = useCallback(async (id) => {
    try {
      setMsgLoading(true);
      const { data } = await api.get(`/messages/${id}`);
      setActiveConvo(data.data);
      // mark as read
      await api.put(`/messages/${id}/read`);
      // refresh list to update unread badges
      fetchConversations();
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setMsgLoading(false);
    }
  }, [fetchConversations]);

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

  // ── Close conversation ───────────────────────────────────────
  const closeConvo = async (id) => {
    if (!window.confirm('Close this conversation?')) return;
    try {
      await api.put(`/messages/${id}/close`);
      toast.success('Conversation closed');
      setActiveConvo(null);
      fetchConversations();
    } catch {
      toast.error('Failed to close conversation');
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages]);

  // ── Enter key to send ────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filter conversations ─────────────────────────────────────
  const filtered = conversations.filter((c) => {
    const name = `${c.student?.firstName || ''} ${c.student?.lastName || ''} ${c.subject || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  // ── Stats ────────────────────────────────────────────────────
  const totalConvos   = conversations.length;
  const activeConvos  = conversations.filter(c => c.status === 'active').length;
  const totalUnread   = conversations.reduce((s, c) => s + (c.unreadByAdmin || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaComments className="text-gold" /> Chat / Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">Student-Admin messaging system</p>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Conversations', val: totalConvos, color: 'text-blue-400' },
          { label: 'Active',              val: activeConvos, color: 'text-green-400' },
          { label: 'Unread Messages',     val: totalUnread,  color: 'text-gold' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Chat Container ── */}
      <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden"
        style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>

        {/* ── LEFT: Conversation List ── */}
        <div className={`w-full md:w-96 border-r border-white/10 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
          {/* Search + Filter */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-gold/50" />
            </div>
            <div className="flex gap-2">
              {['', 'active', 'closed'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}>
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <FaComments className="mx-auto text-3xl mb-2 opacity-30" />
                <p className="text-sm">No conversations</p>
              </div>
            ) : (
              filtered.map((c) => (
                <button key={c._id} onClick={() => openConvo(c._id)}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all ${
                    activeConvo?._id === c._id ? 'bg-white/10 border-l-2 border-l-gold' : ''
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-gold text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm truncate">
                          {c.student?.firstName} {c.student?.lastName}
                        </p>
                        <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                          {timeAgo(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{c.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {c.status === 'closed' && (
                          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Closed</span>
                        )}
                        {c.unreadByAdmin > 0 && (
                          <span className="bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {c.unreadByAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: Messages Panel ── */}
        <div className={`flex-1 flex flex-col ${activeConvo ? 'flex' : 'hidden md:flex'}`}>
          {!activeConvo ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaComments className="mx-auto text-5xl mb-3 opacity-20" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm mt-1">Choose from the list to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveConvo(null)} className="md:hidden text-gray-400 hover:text-white mr-1">
                    <FaArrowLeft />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-blue-500/20 flex items-center justify-center">
                    <FaUser className="text-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {activeConvo.student?.firstName} {activeConvo.student?.lastName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {activeConvo.student?.admissionNumber} — {activeConvo.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeConvo.status === 'active' && (
                    <button onClick={() => closeConvo(activeConvo._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                      <FaLock className="text-[10px]" /> Close
                    </button>
                  )}
                  {activeConvo.status === 'closed' && (
                    <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20">
                      <FaLock className="mr-1 inline text-[10px]" /> Closed
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  </div>
                ) : (
                  activeConvo.messages?.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isAdmin
                            ? 'bg-gold/20 text-white rounded-br-md'
                            : 'bg-white/10 text-gray-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-gold/60 text-right' : 'text-gray-500'}`}>
                            {isAdmin ? 'You' : activeConvo.student?.firstName} · {fmtTime(msg.sentAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              {activeConvo.status === 'active' ? (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your reply… (Enter to send)"
                      rows={2}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-gold/50 placeholder-gray-500"
                    />
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
  );
}
