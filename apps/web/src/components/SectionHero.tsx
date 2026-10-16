import React from 'react';
import { Icon } from './Icons';

interface SectionHeroProps {
  iconId: string;
  title: string;
  description: string;
}

export function SectionHero({ iconId, title, description }: SectionHeroProps) {
  return (
    <div className="section-hero">
      <div className="section-hero-icon">
        <Icon id={iconId} size={64} />
      </div>
      <div className="section-hero-text">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
