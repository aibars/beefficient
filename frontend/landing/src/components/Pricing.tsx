import { useEffect, useState } from 'react';
import { PricingPlan } from '@/types';

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    fetch('/data/pricing.json')
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <h2 className="section-title">Planes y precios</h2>
        <p className="section-subtitle">
          Elige el plan que mejor se adapta a tus necesidades
        </p>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
            >
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">${plan.price}</span>
                <span className="period">/mes</span>
              </div>
              <p className="description">{plan.description}</p>

              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>

              <a href="#contact" className="btn btn-primary btn-block">
                Comenzar prueba gratuita
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
