export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
