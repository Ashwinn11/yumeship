export type TemplateConfig = {
  title: string;
  gradStart: string;
  gradEnd: string;
  tapePattern: 'stripe' | 'dot' | 'heart' | 'check' | 'solid';
  tapeColor: string;
};

export const TEMPLATE_CONFIG: Record<string, TemplateConfig> = {
  'get-to-know': {
    title: 'Get to Know',
    gradStart: '#f3b6c4',
    gradEnd: '#d77a8d',
    tapePattern: 'heart',
    tapeColor: 'rgba(255,255,255,0.9)',
  },
  'kawaii-ui': {
    title: 'Kawaii UI',
    gradStart: '#c7b5e3',
    gradEnd: '#8b6fc4',
    tapePattern: 'dot',
    tapeColor: 'rgba(255,255,255,0.8)',
  },
  'heart-frame': {
    title: 'Heart Frame',
    gradStart: '#fadde5',
    gradEnd: '#d77a8d',
    tapePattern: 'heart',
    tapeColor: 'rgba(255,255,255,0.9)',
  },
  'aesthetic': {
    title: 'Aesthetic Board',
    gradStart: '#f0d189',
    gradEnd: '#b8902a',
    tapePattern: 'check',
    tapeColor: 'rgba(255,255,255,0.8)',
  },
  'this-or-that': {
    title: 'This or That',
    gradStart: '#b4c8a5',
    gradEnd: '#6e8762',
    tapePattern: 'dot',
    tapeColor: 'rgba(255,255,255,0.8)',
  },
  'boundaries': {
    title: 'Boundaries',
    gradStart: '#f4b89a',
    gradEnd: '#b76b48',
    tapePattern: 'stripe',
    tapeColor: 'rgba(255,255,255,0.8)',
  },
  'love-letter': {
    title: 'Love Letter',
    gradStart: '#fadde5',
    gradEnd: '#6e3a5a',
    tapePattern: 'heart',
    tapeColor: 'rgba(255,255,255,0.9)',
  },
  'storyline': {
    title: 'Storyline',
    gradStart: '#ece4f7',
    gradEnd: '#8b6fc4',
    tapePattern: 'check',
    tapeColor: 'rgba(255,255,255,0.8)',
  },
  'headcanons': {
    title: 'Headcanons',
    gradStart: '#fbecc4',
    gradEnd: '#b8902a',
    tapePattern: 'dot',
    tapeColor: 'rgba(255,255,255,0.8)',
  },
};
