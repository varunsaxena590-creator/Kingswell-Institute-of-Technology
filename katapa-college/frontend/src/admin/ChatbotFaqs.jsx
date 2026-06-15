import { useEffect, useState } from 'react';
import { FaCheck, FaComments, FaPlus, FaSave, FaSpinner, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const emptyForm = { question: '', answer: '', tags: '', isActive: true };

export default function ChatbotFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [faqRes, unansweredRes] = await Promise.all([
        api.get('/chatbot/admin/faqs'),
        api.get('/chatbot/admin/unanswered'),
      ]);
      setFaqs(faqRes.data.faqs || []);
      setUnanswered(unansweredRes.data.questions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load chatbot data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveFaq = async (e) => {
    e.preventDefault();
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      isActive: form.isActive,
    };
    if (!payload.question || !payload.answer) return toast.error('Question and answer are required');

    try {
      if (editingId) {
        await api.put(`/chatbot/admin/faqs/${editingId}`, payload);
        toast.success('FAQ updated');
      } else {
        await api.post('/chatbot/admin/faqs', payload);
        toast.success('FAQ added');
      }
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save FAQ');
    }
  };

  const editFaq = (faq) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      tags: (faq.tags || []).join(', '),
      isActive: faq.isActive,
    });
  };

  const deleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/chatbot/admin/faqs/${id}`);
      toast.success('FAQ deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete FAQ');
    }
  };

  const answerQuestion = async (item) => {
    const answer = answers[item._id]?.trim();
    if (!answer) return toast.error('Write an answer first');
    try {
      await api.post(`/chatbot/admin/unanswered/${item._id}/answer`, { answer, tags: [] });
      toast.success('Answer saved as FAQ');
      setAnswers((prev) => ({ ...prev, [item._id]: '' }));
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not answer question');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[#d4af37]">
        <FaSpinner className="animate-spin" />
        Loading chatbot FAQs...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#d4af37] to-[#a0821a] text-black">
            <FaComments />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Chatbot FAQ Editor</h1>
            <p className="text-xs text-white/40">Manage answers and convert unanswered questions into FAQs.</p>
          </div>
        </div>
        <button onClick={resetForm} className="flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#d4af37]">
          <FaPlus /> New FAQ
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={saveFaq} className="rounded-2xl border border-[#d4af37]/10 bg-[#141420] p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#d4af37]">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <div className="space-y-3">
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Question"
              className="w-full rounded-xl border border-white/10 bg-[#0f0f1a] px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/60"
            />
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Answer"
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-[#0f0f1a] px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/60"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags, comma separated"
              className="w-full rounded-xl border border-white/10 bg-[#0f0f1a] px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/60"
            />
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-bold text-black hover:bg-[#c8a42f]">
              <FaSave /> Save FAQ
            </button>
          </div>
        </form>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-[#d4af37]/10 bg-[#141420] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#d4af37]">Unanswered Questions</h2>
            <div className="space-y-3">
              {unanswered.filter((item) => item.status === 'open').length === 0 ? (
                <p className="text-sm text-white/40">No open unanswered questions.</p>
              ) : (
                unanswered.filter((item) => item.status === 'open').map((item) => (
                  <div key={item._id} className="rounded-xl border border-white/10 bg-[#0f0f1a] p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.question}</p>
                      <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs text-yellow-300">{item.language.toUpperCase()}</span>
                    </div>
                    <textarea
                      value={answers[item._id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [item._id]: e.target.value }))}
                      placeholder="Write answer and save it as FAQ"
                      rows={2}
                      className="mb-2 w-full rounded-xl border border-white/10 bg-[#141420] px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/60"
                    />
                    <button onClick={() => answerQuestion(item)} className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">
                      <FaCheck /> Save as FAQ
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d4af37]/10 bg-[#141420] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#d4af37]">Custom FAQs</h2>
            <div className="space-y-3">
              {faqs.length === 0 ? (
                <p className="text-sm text-white/40">No custom FAQs yet.</p>
              ) : (
                faqs.map((faq) => (
                  <div key={faq._id} className="rounded-xl border border-white/10 bg-[#0f0f1a] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{faq.question}</p>
                        <p className="mt-1 text-sm text-white/55">{faq.answer}</p>
                        <p className="mt-2 text-xs text-white/35">{(faq.tags || []).join(', ') || 'No tags'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editFaq(faq)} className="rounded-lg border border-[#d4af37]/30 px-3 py-2 text-xs font-semibold text-[#d4af37]">Edit</button>
                        <button onClick={() => deleteFaq(faq._id)} className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-300">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
