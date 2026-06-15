import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const copy = {
  en: {
    title: 'College FAQ Chatbot',
    subtitle: 'Ask about college software features and student services.',
    placeholder: 'Type your question...',
    send: 'Send',
    typing: 'Bot is typing...',
    error: 'Sorry, I could not process your question.',
    open: 'Open page',
    intro:
      'Hi! Ask me about admission, courses, fees, attendance, results, timetable, library, notices, events, placements, and student services.',
  },
  hi: {
    title: 'College FAQ Chatbot',
    subtitle: 'College software features aur student services ke baare me puchho.',
    placeholder: 'Apna question likho...',
    send: 'Bhejo',
    typing: 'Bot jawab likh raha hai...',
    error: 'Sorry, question process nahi ho paya.',
    open: 'Page kholo',
    intro:
      'Namaste! Admission, courses, fees, attendance, results, timetable, library, notices, events, placements aur student services ke baare me puchho.',
  },
};

const Chatbot = () => {
  const [faqs, setFaqs] = useState([]);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([{ from: 'bot', text: copy.en.intro }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    axios.get('/chatbot/faqs').then((res) => setFaqs(res.data.faqs || [])).catch(() => setFaqs([]));
  }, []);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const switchLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setMessages((msgs) => [...msgs, { from: 'bot', text: copy[nextLanguage].intro }]);
  };

  const sendMessage = async () => {
    const question = input.trim();
    if (!question) return;

    setMessages((msgs) => [...msgs, { from: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/chatbot/ask', { question, language });
      setMessages((msgs) => [
        ...msgs,
        {
          from: 'bot',
          text: res.data.answer || copy[language].error,
          link: res.data.link,
          linkLabel: res.data.linkLabel || copy[language].open,
        },
      ]);
    } catch {
      setMessages((msgs) => [...msgs, { from: 'bot', text: copy[language].error }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-yellow-200 overflow-hidden">
        <div className="bg-yellow-600 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{copy[language].title}</h2>
            <p className="text-sm text-yellow-50">{copy[language].subtitle}</p>
          </div>
          <div className="flex rounded-md bg-white/15 p-0.5 text-xs font-semibold">
            {['en', 'hi'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchLanguage(item)}
                className={`px-3 py-1.5 rounded ${language === item ? 'bg-white text-yellow-700' : 'text-white hover:bg-white/10'}`}
                aria-pressed={language === item}
              >
                {item === 'en' ? 'English' : 'Hindi'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-100">
          {faqs.slice(0, 8).map((faq) => (
            <button
              key={faq.id || faq._id || faq.question}
              className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded text-xs text-gray-800"
              onClick={() => setInput(faq.question)}
              type="button"
            >
              {faq.question}
            </button>
          ))}
        </div>

        <div
          ref={chatBodyRef}
          onWheel={(e) => e.stopPropagation()}
          className="chatbot-scroll h-96 max-h-[60vh] overflow-y-auto overscroll-contain p-4 bg-slate-50 flex flex-col gap-2"
        >
          {messages.map((msg, i) => (
            <div key={`${msg.from}-${i}`} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.from === 'user' ? 'bg-yellow-100 text-gray-900 border border-yellow-200' : 'bg-white border border-gray-200 text-gray-900'}`}>
                <div>{msg.text}</div>
                {msg.link && (
                  <Link
                    to={msg.link}
                    className="mt-2 inline-flex items-center rounded-md bg-yellow-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-yellow-700"
                  >
                    {msg.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-gray-500">{copy[language].typing}</div>}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100 bg-white">
          <input
            className="flex-1 min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100 disabled:text-gray-500"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={copy[language].placeholder}
            disabled={loading}
          />
          <button
            className="rounded-md bg-yellow-600 text-white px-5 py-2 text-sm font-semibold hover:bg-yellow-700 disabled:opacity-50"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            type="button"
          >
            {copy[language].send}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
