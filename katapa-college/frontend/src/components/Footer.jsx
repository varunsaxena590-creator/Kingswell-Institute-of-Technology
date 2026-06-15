// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Footer.jsx (Component)                               ║
// ║  PATH: frontend/src/components/Footer.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Website ka footer section.                       ║
// ║  → Quick links, contact info, social media icons.           ║
// ║  → Har page ke bottom mein dikhta hai.                      ║
// ╚══════════════════════════════════════════════════════════════╝
// src/components/Footer.jsx — Site Footer
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const socials = [
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t('footer.aboutUs'), to: '/about' },
    { label: t('nav.courses'), to: '/courses' },
    { label: t('nav.faculty'), to: '/faculty' },
    { label: t('nav.gallery'), to: '/gallery' },
    { label: t('footer.admissions'), to: '/admission' },
    { label: t('nav.contact'), to: '/contact' },
  ];

  return (
    <footer className="bg-dark-200 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/pics/logo.png" alt="Kingswell Logo" className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
              <div className="w-10 h-10 rounded-full bg-gold-gradient items-center justify-center font-heading font-bold text-dark text-lg" style={{display:'none'}}>
                K
              </div>
              <span className="font-heading font-bold text-xl">
                <span className="gold-text">Kingswell</span>{' '}
                <span className="text-white">College</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('footer.brandDesc')}
            </p>
            {/* Social icons */}
            <div className="flex gap-3 flex-wrap">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors duration-200"
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-lg relative">
              {t('footer.quickLinks')}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gold-gradient rounded-full" />
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-gold transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-lg relative">
              {t('footer.contactInfo')}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gold-gradient rounded-full" />
            </h4>
            <ul className="space-y-3">
              {[
                { icon: FaMapMarkerAlt, text: t('footer.address') },
                { icon: FaPhone, text: '+254 700 123 456' },
                { icon: FaEnvelope, text: 'info@kingswellinstitute.ac.ke' },
                { icon: FaClock, text: t('footer.officeHours') },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-400">
                  <Icon className="text-gold mt-0.5 shrink-0" size={14} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5 text-lg relative">
              {t('footer.newsletter')}
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gold-gradient rounded-full" />
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              {t('footer.newsletterDesc')}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="input-field text-sm"
              />
              <button type="submit" className="btn-gold py-2.5 text-sm w-full">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="max-w-7xl mx-auto section-padding flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-gold transition-colors">{t('footer.privacy')}</Link>
            <Link to="#" className="hover:text-gold transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
