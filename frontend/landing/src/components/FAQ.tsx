import { useEffect, useState } from 'react';
import { FAQItem } from '@/types';

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/faq.json')
      .then(res => res.json())
      .then(data => setFaqs(data));
  }, []);

  return (
    <section id="faq" className="faq">
      <div className="container">
        <h2 className="section-title">Preguntas frecuentes</h2>

        <div className="faq-list">
          {faqs.map((item) => (
            <div key={item.id} className="faq-item">
              <button
                className="faq-question"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
              >
                <span>{item.question}</span>
                <span className="faq-icon">
                  {openId === item.id ? '−' : '+'}
                </span>
              </button>
              {openId === item.id && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
