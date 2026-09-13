import { Aperture, Bot, Camera, Code2, MapPinned, Megaphone, Search, Sparkles, type LucideIcon } from 'lucide-react';

export const auditUrl = 'https://www.needmomentum.com/free-website-seo-audit/';

export type Service = {
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  hue: 'blue' | 'yellow';
};

export const services: Service[] = [
  {
    title: 'Search & AI visibility',
    short: 'Be found',
    description: 'Technical SEO, local visibility and AI-search strategy shaped around how your customers actually discover businesses now.',
    icon: Search,
    hue: 'blue'
  },
  {
    title: 'Paid media',
    short: 'Create demand',
    description: 'Focused Google and social campaigns connected to landing experiences, clear reporting and the next best action.',
    icon: Megaphone,
    hue: 'yellow'
  },
  {
    title: 'Web experiences',
    short: 'Convert attention',
    description: 'Fast, useful websites that turn search intent into trust, calls and qualified conversations.',
    icon: Code2,
    hue: 'blue'
  },
  {
    title: 'Momentum 360',
    short: 'Show the space',
    description: 'Virtual tours, photography, video and spatial media that make a physical location feel close from anywhere.',
    icon: Aperture,
    hue: 'yellow'
  },
  {
    title: 'Local presence',
    short: 'Own the map',
    description: 'Google Business Profile strategy, listings and location content built to earn the next nearby customer.',
    icon: MapPinned,
    hue: 'blue'
  },
  {
    title: 'AI systems',
    short: 'Move faster',
    description: 'Practical automations and agent experiences that improve response time without flattening the human voice.',
    icon: Bot,
    hue: 'yellow'
  }
];

export const proofImages = [
  { src: '/assets/proof/residential-townhome.jpg', label: 'Residential spaces', alt: 'Bright residential townhome photographed for a virtual tour' },
  { src: '/assets/proof/commercial-skyline.jpg', label: 'Commercial places', alt: 'Commercial skyline seen from a modern interior' },
  { src: '/assets/proof/hospitality.jpg', label: 'Hospitality', alt: 'Hospitality venue photographed for immersive marketing' },
  { src: '/assets/proof/automotive.jpg', label: 'Automotive', alt: 'Automotive showroom prepared for a 360 experience' },
  { src: '/assets/proof/meeting-space.jpg', label: 'Meeting spaces', alt: 'Business meeting space photographed for digital marketing' }
];

export const values = [
  { icon: Sparkles, title: 'One clear point of view', text: 'Strategy, media and technology reinforce the same story instead of competing for attention.' },
  { icon: Camera, title: 'Proof people can feel', text: 'Real spaces, real founders and real work replace placeholder promises.' },
  { icon: MapPinned, title: 'Built around the next move', text: 'Every page and campaign has an intentional path from discovery to action.' }
];
