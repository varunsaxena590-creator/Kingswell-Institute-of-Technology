import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const MCQExam = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/mcq-exams')
      .then(res => setExams(res.data.exams || res.data.data || []))
      .catch(() => setExams([]));
  }, []);

  const startExam = (exam) => {
    setLoading(true);
    axios.get(`/mcq-exams/${exam._id}`)
      .then(res => {
        const examData = res.data.exam || res.data.data || null;
        setSelectedExam(examData);
        setAnswers(Array(examData?.questions?.length || 0).fill(null));
        setResult(null);
      })
      .catch(() => {
        setSelectedExam(null);
      })
      .finally(() => setLoading(false));
  };

  const handleOptionChange = (qIdx, optIdx) => {
    setAnswers(a => a.map((ans, i) => i === qIdx ? optIdx : ans));
  };

  const submitExam = () => {
    setLoading(true);
    axios.post(`/mcq-exams/${selectedExam._id}/submit`, { answers })
      .then(res => setResult(res.data.data || res.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  };

  if (loading) return <div>Loading...</div>;

  if (selectedExam) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-2">{selectedExam.title}</h2>
        <p className="mb-4">{selectedExam.description}</p>
        {selectedExam.questions.map((q, i) => (
          <div key={i} className="mb-4">
            <div className="font-semibold">Q{i+1}. {q.question}</div>
            <div className="ml-4">
              {q.options.map((opt, j) => (
                <label key={j} className="block">
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === j}
                    onChange={() => handleOptionChange(i, j)}
                  /> {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={submitExam}
          disabled={answers.includes(null)}
        >Submit</button>
        {result && (
          <div className="mt-4 font-bold text-green-700">
            Your Score: {result.score} / {result.total}
          </div>
        )}
        <button className="mt-4 text-blue-500 underline" onClick={() => setSelectedExam(null)}>Back to Exams</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Available MCQ Exams</h2>
      {exams.length === 0 && <div>No exams available.</div>}
      <ul>
        {exams.map(exam => (
          <li key={exam._id} className="mb-2 flex justify-between items-center">
            <span>{exam.title}</span>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => startExam(exam)}
            >Start</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MCQExam;
