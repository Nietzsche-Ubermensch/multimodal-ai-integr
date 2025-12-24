export interface Slide {
  id: string;
  title: string;
  category: string;
  component: React.ComponentType;
}

export interface CodeExample {
  language: string;
  code: string;
  title?: string;
}

export interface ModelSpec {
  name: string;
  provider: string;
  endpoint: string;
  contextWindow: string;
  features: string[];
  pricing?: string;
}
