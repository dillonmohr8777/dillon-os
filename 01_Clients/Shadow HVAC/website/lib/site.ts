// Central content + business data for Shadow Heating & Cooling.
// Sourced from shadowheatingandcooling.com + the "bear concept" build.

export const business = {
  name: "Shadow Heating & Cooling",
  shortName: "Shadow HVAC",
  tagline: "Defend Your Comfort Zone",
  subTagline: "Fast Response. No Fumbles.",
  phone: "(847) 757 9450",
  phoneHref: "tel:+18477579450",
  email: "Shadowhvac1@gmail.com",
  emailHref: "mailto:Shadowhvac1@gmail.com",
  address: {
    street: "334 E Grove",
    city: "Hampshire",
    state: "IL",
    zip: "60140",
    full: "334 E Grove, Hampshire, IL 60140",
  },
  hours: "24/7 Emergency Service",
  bookingUrl: "https://book.housecallpro.com/book/Shadow-Heating--Cooling/",
  domain: "shadowheatingandcooling.com",
  social: {
    facebook: "https://www.facebook.com/shadowHVAC/",
    instagram: "https://www.instagram.com/shadowhvac/",
    twitter: "https://twitter.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "Service Area", href: "/service-area" },
  { label: "Reviews", href: "/reviews" },
  { label: "Financing", href: "/financing" },
  { label: "Advice", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const stats = [
  { value: 24, suffix: "/7", label: "Emergency Response" },
  { value: 100, suffix: "%", label: "Satisfaction Guarantee" },
  { value: 5, suffix: "★", label: "Local Reviews" },
  { value: 15, suffix: "+", label: "Communities Served" },
] as const;

export const valueProps = [
  {
    title: "24/7 Emergency Response",
    body: "Furnace out at 2 a.m.? We answer. No answering machine and no runaround. A real technician is on the way.",
    tone: "ember" as const,
  },
  {
    title: "100% Satisfaction Guarantee",
    body: "We don't leave until your comfort zone is defended. If it isn't right, we make it right.",
    tone: "ice" as const,
  },
  {
    title: "Five Star Local Reviews",
    body: "Hampshire neighbors trust us for honest pricing and work that lasts. Read the reviews.",
    tone: "gold" as const,
  },
  {
    title: "Locally Owned & Operated",
    body: "Based in Hampshire, serving Kane County. We treat your home like it is on our block, because it is.",
    tone: "ember" as const,
  },
];

// The Championship Playbook is Shadow's service philosophy with a football motif.
export const playbook = [
  {
    num: "01",
    title: "First Down Diagnosis",
    body: "We read the field before we make a call. A precise diagnosis means no wasted downs and no surprise charges.",
  },
  {
    num: "02",
    title: "No Huddle Response",
    body: "Same day and emergency service that moves fast. When your heat or AC is down, every minute counts.",
  },
  {
    num: "03",
    title: "Clean Pocket Install",
    body: "Protected, precise, code compliant installations. We give your new system a clean pocket to perform for years.",
  },
  {
    num: "04",
    title: "Fourth Quarter Tune Up",
    body: "Seasonal maintenance that keeps you strong in the fourth quarter, through the coldest and hottest days of the year.",
  },
];

export type Service = {
  slug: string;
  name: string;
  short: string;
  body: string;
  bullets: string[];
  tone: "ember" | "ice" | "gold";
  icon: "flame" | "snowflake" | "wind" | "shield" | "siren" | "gauge" | "wrench" | "leaf";
  img?: string;
};

export const services: Service[] = [
  {
    slug: "heating",
    name: "Heating",
    short: "Furnace repair, installation and maintenance",
    body: "When the Illinois cold rolls in, your furnace is your first line of defense. We repair, replace, and tune every make and model so your home stays warm all winter.",
    bullets: [
      "Furnace repair & replacement",
      "High efficiency system installation",
      "Heat pump service & seasonal swing",
      "Emergency heating calls, 24/7",
    ],
    tone: "ember",
    icon: "flame",
    img: "/img/bear-heating.jpg",
  },
  {
    slug: "cooling",
    name: "Cooling / AC",
    short: "AC repair, installation and tune ups",
    body: "Beat the Midwest humidity with a cooling system that actually keeps up. From quick repairs to efficient new installations, we keep your comfort zone cool.",
    bullets: [
      "AC repair and diagnostics",
      "New AC and condenser installation",
      "Cooling season tune ups",
      "Refrigerant checks and recharge",
    ],
    tone: "ice",
    icon: "snowflake",
    img: "/img/bear-cooling.jpg",
  },
  {
    slug: "indoor-air-quality",
    name: "Indoor Air Quality",
    short: "Filtration and whole home comfort",
    body: "The air you breathe matters. We install and service filtration, humidification, and purification to make your home healthier and more comfortable.",
    bullets: [
      "Whole home air filtration",
      "Humidifiers and dehumidifiers",
      "Duct inspection and sealing",
      "Air purification systems",
    ],
    tone: "ice",
    icon: "wind",
    img: "/img/bear-air.jpg",
  },
  {
    slug: "maintenance-plans",
    name: "Maintenance Plans",
    short: "Priority service, reduced costs",
    body: "Members get priority scheduling, discounted repairs, and two tune ups each year that stop breakdowns before they start. Defense wins championships.",
    bullets: [
      "Two seasonal tune ups per year",
      "Priority emergency scheduling",
      "Discounted parts and labor",
      "Extended equipment life",
    ],
    tone: "gold",
    icon: "shield",
  },
  {
    slug: "emergency-hvac",
    name: "Emergency HVAC",
    short: "24/7 same day response",
    body: "Systems don't fail on a schedule. Our technicians are on call around the clock, including nights, weekends, and holidays.",
    bullets: [
      "24/7 live dispatch",
      "Same day emergency repair",
      "Nights, weekends and holidays",
      "Upfront emergency pricing",
    ],
    tone: "ember",
    icon: "siren",
  },
  {
    slug: "thermostat-setup",
    name: "Thermostat And Smart Home",
    short: "Smart thermostat installation and setup",
    body: "Take control of your comfort and your energy bill. We install and configure smart thermostats and integrate them with your home.",
    bullets: [
      "Smart thermostat installation",
      "Programming and app setup",
      "Zoning and smart home integration",
      "Energy savings configuration",
    ],
    tone: "gold",
    icon: "gauge",
  },
];

export type Pkg = {
  name: string;
  price: number;
  cadence: string;
  blurb: string;
  features: string[];
  featured?: boolean;
};

export const packages: Pkg[] = [
  {
    name: "Basic",
    price: 29,
    cadence: "/mo",
    blurb: "Affordable maintenance for essential HVAC care.",
    features: [
      "Seasonal tune ups",
      "Filter replacement",
      "Basic inspections",
      "Energy efficiency check",
      "Priority scheduling",
    ],
  },
  {
    name: "Standard",
    price: 49,
    cadence: "/mo",
    blurb: "Enhanced service for better efficiency and comfort.",
    features: [
      "All Basic features",
      "Ductwork inspection",
      "Thermostat calibration",
      "Minor repairs included",
      "Emergency support",
    ],
  },
  {
    name: "Advanced",
    price: 79,
    cadence: "/mo",
    blurb: "Comprehensive coverage for total HVAC care.",
    featured: true,
    features: [
      "All Standard features",
      "Advanced diagnostics",
      "Refrigerant checks",
      "Extended warranty",
      "24/7 priority support",
    ],
  },
  {
    name: "Premium",
    price: 99,
    cadence: "/mo",
    blurb: "Complete HVAC protection with exclusive benefits.",
    features: [
      "All Advanced features",
      "Free service calls",
      "Annual system overhaul",
      "Smart home integration",
      "VIP customer support",
    ],
  },
];

export type Review = {
  name: string;
  location: string;
  stars: number;
  quote: string;
};

export const reviews: Review[] = [
  {
    name: "John Carter",
    location: "Hampshire, IL",
    stars: 5,
    quote:
      "Called Shadow when our furnace quit on a freezing night. A tech was at the door fast, diagnosed it straight, and had us warm again same night. Honest pricing, no games.",
  },
  {
    name: "Emily Thompson",
    location: "Pingree Grove, IL",
    stars: 5,
    quote:
      "Professional from the first call. They explained every option for our new AC without pressure and the install was spotless. This is how a local company should run.",
  },
  {
    name: "Michael Reynolds",
    location: "Huntley, IL",
    stars: 5,
    quote:
      "On time, upfront on price, and genuinely friendly. They tuned up both our systems and our energy bill actually dropped. Shadow has earned a customer for life.",
  },
  {
    name: "Sarah Delgado",
    location: "Gilberts, IL",
    stars: 5,
    quote:
      "The maintenance plan pays for itself. Priority scheduling meant we skipped the summer wait list, and the tech caught a small issue before it became a big one.",
  },
  {
    name: "Tom Brennan",
    location: "Burlington, IL",
    stars: 5,
    quote:
      "Fast response, no fumbles. Exactly like they say. They defended our comfort zone when a heat wave took out our old unit. I could not recommend them more.",
  },
];

export const serviceAreas = [
  { name: "Hampshire", note: "HQ", primary: true },
  { name: "Burlington", note: "" },
  { name: "Huntley", note: "" },
  { name: "Pingree Grove", note: "" },
  { name: "Gilberts", note: "" },
  { name: "Elgin", note: "" },
  { name: "Kane County", note: "Full coverage" },
  { name: "Elburn", note: "" },
];

export const process = [
  {
    step: "01",
    title: "Consultation Call",
    body: "Tell us what's happening. We listen, ask the right questions, and schedule a visit that works for you.",
  },
  {
    step: "02",
    title: "Thorough Inspection",
    body: "Our technician diagnoses the real problem, not just the symptom, and walks you through every option.",
  },
  {
    step: "03",
    title: "Professional Service",
    body: "We do the job right the first time with quality parts, clean work, and respect for your home.",
  },
  {
    step: "04",
    title: "Guaranteed Satisfaction",
    body: "We stand behind our work with warranties and a 100% satisfaction guarantee. Comfort defended.",
  },
];

export type FAQItem = { q: string; a: string };

export const faqs: FAQItem[] = [
  {
    q: "What services does Shadow Heating & Cooling provide?",
    a: "We provide air conditioning installation, upgrades, repair, and maintenance; heating system service and installation; indoor air quality solutions; and energy efficiency consultations. We also offer 24/7 emergency repair services.",
  },
  {
    q: "How do I schedule an appointment with Shadow Heating and Cooling?",
    a: "You can call (847) 757-9450 or use our online booking system to select a convenient date and time. Emergency calls are answered around the clock.",
  },
  {
    q: "Why is regular air conditioning maintenance important?",
    a: "Regular upkeep ensures your system runs properly, avoids unexpected malfunctions, and extends the life of your equipment. It also improves indoor air quality and reduces energy costs.",
  },
  {
    q: "How often should I replace my air filters?",
    a: "Air filters should be changed every one to three months, depending on usage, the filter type, and the air quality in your home.",
  },
  {
    q: "What should I consider when choosing a new air conditioning system?",
    a: "Consider the size of your space, energy efficiency ratings (SEER), your budget, and any specific comfort needs. Our team can guide your selection to get the right fit.",
  },
  {
    q: "How can I reduce my energy bills with my current HVAC system?",
    a: "Options include regular maintenance, using a programmable or smart thermostat, sealing duct leaks, and ensuring proper home insulation. We also offer energy efficiency consultations.",
  },
  {
    q: "Do you offer emergency repair services?",
    a: "Yes. We provide 24/7 emergency repair services with technicians available anytime, including nights and holidays.",
  },
  {
    q: "How long does an air conditioning installation take?",
    a: "Most installations can be completed within one or two days, though timing depends on the unit type, size, and the complexity of the job.",
  },
  {
    q: "Can I get a quote for my HVAC project?",
    a: "Yes. We offer free quotes for all HVAC projects, with transparent and detailed proposals.",
  },
  {
    q: "What financing options are available for new installations?",
    a: "We offer flexible financing options and work with GoodLeap and JB Warranties to make new installations affordable.",
  },
  {
    q: "Do you offer warranties on your services?",
    a: "Yes, we provide warranties on our services and the parts we install. Specifics depend on the service provided.",
  },
  {
    q: "How often should I have my HVAC system serviced?",
    a: "We recommend servicing your system twice per year, ideally before the start of the heating and cooling seasons, for optimal performance and efficiency.",
  },
];

export const team = [
  { name: "Michael Carter", role: "Lead Technician" },
  { name: "Emily Foster", role: "Customer Support Manager" },
  { name: "David Reynolds", role: "HVAC Specialist" },
  { name: "Sophia Mitchell", role: "Operations Coordinator" },
];

export const aboutValues = [
  { title: "Experienced Team", body: "Skilled HVAC professionals delivering excellent service on every call." },
  { title: "Reliable Service", body: "Quick, efficient heating and cooling solutions you can count on." },
  { title: "Energy Efficiency", body: "Performance optimization that helps reduce your energy costs." },
  { title: "Quality Assurance", body: "Work built to last, backed by reliable HVAC performance." },
  { title: "Customer First", body: "Your comfort, happiness, and satisfaction are our top priorities." },
  { title: "Advanced Technology", body: "The latest tools and techniques for superior, lasting results." },
];

export const financing = {
  partners: ["GoodLeap", "JB Warranties"],
  points: [
    {
      title: "Flexible Monthly Payments",
      body: "Spread the cost of a new system over affordable monthly payments that fit your budget.",
    },
    {
      title: "Fast, Simple Approval",
      body: "Quick online applications through our financing partners are often approved in minutes.",
    },
    {
      title: "Competitive Rates",
      body: "Work with GoodLeap for financing options designed for home comfort upgrades.",
    },
    {
      title: "Warranty Protection",
      body: "Protect your investment with extended warranty coverage through JB Warranties.",
    },
  ],
};
