import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBroom, FaHistory, FaMoon, FaRobot, FaSearch, FaSun, FaTimes, FaWindowMinimize } from 'react-icons/fa';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const copy = {
  en: {
    title: 'College Assistant',
    placeholder: 'Ask a question...',
    send: 'Send',
    typing: 'Bot is typing...',
    error: 'Sorry, there was an error. Please try again.',
    open: 'Open page',
    history: 'History',
    search: 'Search answer',
    clear: 'Clear chat',
    dark: 'Dark mode',
    light: 'Light mode',
    minimize: 'Minimize chat',
    unanswered: 'Saved for admin review',
    intro: 'Hi! Ask me about admission, fees, results, attendance, documents, hall tickets, or your status.',
  },
  hi: {
    title: 'College Assistant',
    placeholder: 'Apna question likho...',
    send: 'Bhejo',
    typing: 'Bot jawab likh raha hai...',
    error: 'Sorry, error aa gaya. Dobara try karo.',
    open: 'Page kholo',
    history: 'History',
    search: 'Answer search',
    clear: 'Chat clear',
    dark: 'Dark mode',
    light: 'Light mode',
    minimize: 'Chat chhota karo',
    unanswered: 'Admin review ke liye save ho gaya',
    intro: 'Namaste! Admission, fees, results, attendance, documents, hall ticket, ya apna status poochho.',
  },
};

const defaultActions = [
  { label: 'Apply Admission', labelHi: 'Admission Apply', value: 'I want to apply for admission', link: '/admission' },
  { label: 'Check Fees', labelHi: 'Fees Check', value: 'Where can I check fees?', link: '/my-fees' },
  { label: 'View Result', labelHi: 'Result Dekho', value: 'How can I see my result?', link: '/my-results' },
  { label: 'Hall Ticket', labelHi: 'Hall Ticket', value: 'How do I get my hall ticket?', link: '/my-hall-ticket' },
  { label: 'My Status', labelHi: 'Mera Status', value: 'Show my status', link: '/profile' },
];

const highlightText = (text, query) => {
  if (!query.trim()) return text;
  const safe = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safe})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-0.5 text-gray-950">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const Chatbot = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([{ from: 'bot', text: copy.en.intro }]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('college_chatbot_theme') === 'dark');
  const [history, setHistory] = useState([]);
  const [actions, setActions] = useState(defaultActions);
  const chatBodyRef = useRef(null);

  const visibleHistory = useMemo(() => history.slice(0, 8), [history]);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    api.get('/chatbot/quick-actions').then((res) => setActions(res.data.actions || defaultActions)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.token) {
      setHistory([]);
      return;
    }

    api.get('/chatbot/history').then((res) => setHistory(res.data.history || [])).catch(() => setHistory([]));
  }, [user?.token]);

  useEffect(() => {
    localStorage.setItem('college_chatbot_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const switchLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setMessages((msgs) => [...msgs, { from: 'bot', text: copy[nextLanguage].intro }]);
  };

  const askQuestion = async (question) => {
    if (!question.trim()) return;

    setMessages((msgs) => [...msgs, { from: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/ask', { question, language });
      const nextMessage = {
        from: 'bot',
        text: res.data.answer || copy[language].error,
        link: res.data.link,
        linkLabel: res.data.linkLabel || copy[language].open,
        unansweredSaved: res.data.unansweredSaved,
      };
      setMessages((msgs) => [...msgs, nextMessage]);
      setHistory((items) => [
        {
          _id: `${Date.now()}`,
          question,
          answer: nextMessage.text,
          link: nextMessage.link,
          linkLabel: nextMessage.linkLabel,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);
    } catch {
      setMessages((msgs) => [...msgs, { from: 'bot', text: copy[language].error }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    askQuestion(input.trim());
  };

  const clearChat = () => {
    setMessages([{ from: 'bot', text: copy[language].intro }]);
    setSearch('');
    setShowHistory(false);
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-600 text-xl text-white shadow-2xl hover:bg-yellow-700"
        title={copy[language].title}
        aria-label={copy[language].title}
      >
        <FaRobot />
      </button>
    );
  }

  const shellClass = darkMode
    ? 'border-slate-700 bg-slate-950 text-white'
    : 'border-yellow-200 bg-white text-gray-900';
  const panelClass = darkMode ? 'bg-slate-900' : 'bg-slate-50';
  const inputWrapClass = darkMode ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-gray-200 bg-slate-50 text-gray-700';
  const inputClass = darkMode ? 'bg-transparent text-white placeholder-slate-400' : 'bg-transparent text-gray-900';
  const botBubbleClass = darkMode
    ? 'self-start border border-slate-700 bg-slate-800 text-slate-100'
    : 'self-start border border-gray-200 bg-white text-gray-900';
  const userBubbleClass = darkMode
    ? 'self-end border border-yellow-500/30 bg-yellow-500/15 text-yellow-50'
    : 'self-end border border-yellow-200 bg-yellow-100 text-gray-900';

  return (
    <div className={`fixed bottom-5 right-5 z-50 w-[400px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border shadow-2xl ${shellClass}`}>
      <div className="flex items-center justify-between gap-3 bg-yellow-600 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-white/20"><FaRobot /></span>
          <span className="truncate">{copy[language].title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearChat}
            className="grid h-8 w-8 place-items-center rounded-md bg-white/15 hover:bg-white/25"
            title={copy[language].clear}
            aria-label={copy[language].clear}
          >
            <FaBroom />
          </button>
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-md bg-white/15 hover:bg-white/25"
            title={darkMode ? copy[language].light : copy[language].dark}
            aria-label={darkMode ? copy[language].light : copy[language].dark}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-md bg-white/15 hover:bg-white/25"
            title={copy[language].history}
          >
            {showHistory ? <FaTimes /> : <FaHistory />}
          </button>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="grid h-8 w-8 place-items-center rounded-md bg-white/15 hover:bg-white/25"
            title={copy[language].minimize}
            aria-label={copy[language].minimize}
          >
            <FaWindowMinimize />
          </button>
          <div className="flex shrink-0 rounded-md bg-white/15 p-0.5 text-xs font-semibold">
            {['en', 'hi'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchLanguage(item)}
                className={`rounded px-2 py-1 ${language === item ? 'bg-white text-yellow-700' : 'text-white hover:bg-white/10'}`}
                aria-pressed={language === item}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`border-b p-2 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-white'}`}>
        <div className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm ${inputWrapClass}`}>
          <FaSearch className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy[language].search}
            className={`min-w-0 flex-1 text-sm outline-none ${inputClass}`}
          />
        </div>
      </div>

      {showHistory ? (
        <div className={`h-80 max-h-[50vh] overflow-y-auto p-3 ${panelClass}`}>
          {visibleHistory.length === 0 ? (
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No saved chat history yet.</p>
          ) : (
            <div className="space-y-2">
              {visibleHistory.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => askQuestion(item.question)}
                  className={`w-full rounded-lg border p-3 text-left text-sm shadow-sm hover:border-yellow-300 ${
                    darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className={darkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>{item.question}</p>
                  <p className={darkMode ? 'mt-1 line-clamp-2 text-xs text-slate-400' : 'mt-1 line-clamp-2 text-xs text-gray-500'}>{item.answer}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={chatBodyRef}
          onWheel={(e) => e.stopPropagation()}
          className={`chatbot-scroll flex h-80 max-h-[50vh] min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain p-3 ${panelClass}`}
        >
          <div className="mb-1 flex flex-wrap gap-1.5">
            {actions.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => askQuestion(action.value)}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${
                  darkMode ? 'border-yellow-500/30 bg-slate-800 text-yellow-300 hover:bg-slate-700' : 'border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50'
                }`}
              >
                {language === 'hi' ? action.labelHi || action.label : action.label}
              </button>
            ))}
          </div>

          {messages.map((msg, i) => (
            <div
              key={`${msg.from}-${i}`}
              className={`max-w-[92%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${
                msg.from === 'bot' ? botBubbleClass : userBubbleClass
              }`}
            >
              <div>{highlightText(msg.text, search)}</div>
              {msg.unansweredSaved && <div className="mt-2 text-xs font-semibold text-yellow-700">{copy[language].unanswered}</div>}
              {msg.link && (
                <Link
                  to={msg.link}
                  className="mt-2 inline-flex items-center rounded-md bg-yellow-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-yellow-700"
                >
                  {msg.linkLabel}
                </Link>
              )}
            </div>
          ))}
          {loading && <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{copy[language].typing}</div>}
        </div>
      )}

      <form onSubmit={sendMessage} className={`flex gap-2 border-t p-2 ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-gray-200 bg-white'}`}>
        <input
          className={`min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-100 disabled:opacity-60 ${
            darkMode ? 'border-slate-700 bg-slate-900 text-white placeholder-slate-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
          type="text"
          placeholder={copy[language].placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {copy[language].send}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
