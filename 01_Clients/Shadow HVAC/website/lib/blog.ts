export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  modifiedAt: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "repair-or-replace-air-conditioner",
    title: "Should You Repair Or Replace Your Air Conditioner?",
    excerpt: "A practical way to compare age, repair cost, comfort, and efficiency before making a decision.",
    category: "Cooling",
    readTime: "Five minute read",
    image: "/img/recent-installation-condenser.jpg",
    imageAlt: "Recently installed outdoor air conditioning condenser",
    publishedAt: "2026-07-14",
    modifiedAt: "2026-07-14",
    intro: "A failed air conditioner does not always mean you need a new system. The right answer depends on what failed, how the rest of the equipment is performing, and what you want from the home over the next several years.",
    sections: [
      {
        heading: "Start With The Age And Condition",
        paragraphs: [
          "A newer system with one failed part is often a strong repair candidate. An older system with repeated issues, uneven temperatures, or rising energy use deserves a broader look.",
          "The outdoor unit is only part of the system. A useful diagnosis also considers the indoor coil, airflow, electrical condition, refrigerant circuit, and thermostat controls.",
        ],
      },
      {
        heading: "Compare More Than The Repair Price",
        paragraphs: [
          "A repair can restore comfort quickly, but it should make sense in the context of the full system. Ask how likely the repair is to last and whether other major components are showing wear.",
          "Replacement may provide quieter operation, more consistent humidity control, and lower energy use. Those comfort gains matter just as much as the equipment price.",
        ],
      },
      {
        heading: "Get A Clear Recommendation",
        paragraphs: [
          "A good technician should explain the immediate problem, the overall condition, and the realistic options without pressure. Shadow Heating and Cooling gives you the facts so you can choose with confidence.",
        ],
      },
    ],
  },
  {
    slug: "furnace-tune-up-guide",
    title: "What A Furnace Tune Up Should Include",
    excerpt: "A closer look at the safety, airflow, electrical, and performance checks that prepare a furnace for winter.",
    category: "Heating",
    readTime: "Four minute read",
    image: "/img/furnace-coil-service-open.jpg",
    imageAlt: "Open furnace cabinet during a detailed inspection",
    publishedAt: "2026-07-14",
    modifiedAt: "2026-07-14",
    intro: "A furnace tune up is more than a quick filter check. It is a chance to verify safe operation, find developing problems, and help the system deliver steady heat before the hardest weather arrives.",
    sections: [
      {
        heading: "Safety Comes First",
        paragraphs: [
          "The visit should include combustion and venting checks where applicable, plus inspection of the heat exchanger area, safety controls, wiring, and gas connections.",
          "Unusual smells, scorch marks, moisture, and repeated shutdowns can all point to issues that need closer attention.",
        ],
      },
      {
        heading: "Airflow Protects The Equipment",
        paragraphs: [
          "Restricted airflow makes a furnace work harder. A technician should review the filter, blower condition, return path, supply temperatures, and visible duct concerns.",
          "Balanced airflow also helps reduce hot and cold rooms while supporting more comfortable humidity through the home.",
        ],
      },
      {
        heading: "Performance Should Be Measured",
        paragraphs: [
          "The final check should confirm startup, heating operation, thermostat response, and a clean shutdown. Measured results give you a better picture than guesswork.",
        ],
      },
    ],
  },
  {
    slug: "whole-home-humidity-comfort",
    title: "How Whole Home Humidity Changes Comfort",
    excerpt: "Why the same temperature can feel completely different when indoor humidity is too high or too low.",
    category: "Indoor Air Quality",
    readTime: "Five minute read",
    image: "/img/recent-installation-furnace.jpg",
    imageAlt: "Furnace paired with a whole home humidifier",
    publishedAt: "2026-07-14",
    modifiedAt: "2026-07-14",
    intro: "Temperature gets most of the attention, but humidity has a major effect on how your home feels. The right balance can improve comfort, protect materials, and help your heating and cooling equipment do its job.",
    sections: [
      {
        heading: "Winter Air Can Become Too Dry",
        paragraphs: [
          "Cold outdoor air holds less moisture. Once that air enters the home and is heated, it can feel even drier. Static, dry skin, irritated sinuses, and shrinking wood are common clues.",
          "A properly selected whole home humidifier adds controlled moisture through the duct system instead of treating only one room.",
        ],
      },
      {
        heading: "Summer Humidity Can Feel Heavy",
        paragraphs: [
          "High humidity makes warm air feel warmer and can leave the home clammy. Correct equipment sizing, healthy airflow, and proper system operation all affect moisture removal.",
          "If the system cools quickly but humidity stays high, a comfort evaluation can uncover the cause.",
        ],
      },
      {
        heading: "Balance Is Personal",
        paragraphs: [
          "The best indoor setting depends on the season, the home, and your comfort. Shadow can evaluate the complete system and recommend a practical path to steadier comfort.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
