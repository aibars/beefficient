import { useEffect, useState } from 'react';
import { Feature } from '@/types';

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    fetch('/data/features.json')
      .then(res => res.json())
      .then(data => setFeatures(data));
  }, []);

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Características</h2>
        <p className="section-subtitle">
          Todo lo que necesitas para gestionar tu negocio ganadero
        </p>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
