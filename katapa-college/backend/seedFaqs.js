// seedFaqs.js
// Script to seed some default FAQ entries for the AI Chatbot

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Faq = require('./models/Faq');
const connectDB = require('./config/db');

const faqs = [
  {
    question: 'What courses are offered at Kingswell College?',
    answer: 'Kingswell College offers a wide range of undergraduate and postgraduate courses in Technology, Engineering, Business, Finance, Health Sciences, Law, and Arts.',
    tags: ['courses', 'programs', 'admissions']
  },
  {
    question: 'How can I apply for admission?',
    answer: 'You can apply for admission online through our website by filling out the application form and submitting the required documents.',
    tags: ['admission', 'apply', 'application']
  },
  {
    question: 'What is the fee structure?',
    answer: 'The fee structure varies by course. Please visit the Fees section on our website or contact the admissions office for detailed information.',
    tags: ['fees', 'fee structure', 'payment']
  },
  {
    question: 'Is there a hostel facility available?',
    answer: 'Yes, Kingswell College provides hostel accommodation for both boys and girls with all basic amenities.',
    tags: ['hostel', 'accommodation', 'facility']
  },
  {
    question: 'How can I contact the college?',
    answer: 'You can contact us via the Contact page on our website, email, or call our helpline number provided on the site.',
    tags: ['contact', 'support', 'help']
  },
  {
    question: 'Does the college offer scholarships?',
    answer: 'Yes, we offer various scholarships based on merit and need. Please check the Scholarships section for eligibility and application details.',
    tags: ['scholarship', 'financial aid', 'merit']
  },
  {
    question: 'What are the library timings?',
    answer: 'The library is open from 8:00 AM to 8:00 PM on all working days.',
    tags: ['library', 'timings', 'hours']
  },
  {
    question: 'How do I get my ID card?',
    answer: 'ID cards are issued to students after successful admission and document verification. You will be notified by email when your card is ready.',
    tags: ['id card', 'identity', 'admission']
  }
];

const seedFaqs = async () => {
  await connectDB();
  await Faq.deleteMany({});
  await Faq.insertMany(faqs);
  console.log('✅ FAQ chatbot data seeded!');
  process.exit();
};

seedFaqs();
