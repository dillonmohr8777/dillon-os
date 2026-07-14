import { Section } from "./Section";
import { Reveal } from "./Reveal";

type ProofVariant =
  | "craft"
  | "maintenance"
  | "investment"
  | "answers"
  | "trust"
  | "local"
  | "ready";

const proofContent: Record<
  ProofVariant,
  {
    eyebrow: string;
    title: string;
    body: string;
    images: Array<{ src: string; alt: string; label: string }>;
  }
> = {
  craft: {
    eyebrow: "Work In Progress",
    title: "The details behind dependable comfort",
    body: "From clean refrigerant connections to final controls, our technicians handle the work carefully at every stage.",
    images: [
      {
        src: "/img/installation-brazing-in-progress.jpg",
        alt: "Shadow technician brazing a copper refrigerant line during an HVAC installation",
        label: "Installation craftsmanship",
      },
      {
        src: "/img/furnace-coil-service-open.jpg",
        alt: "Open furnace cabinet showing the evaporator coil, controls, and service tools",
        label: "System setup and testing",
      },
    ],
  },
  maintenance: {
    eyebrow: "Protect Your System",
    title: "Maintenance reaches the parts you do not see",
    body: "Professional inspection and seasonal service help the complete system run cleaner, safer, and more efficiently.",
    images: [
      {
        src: "/img/furnace-coil-service-open.jpg",
        alt: "Furnace opened for inspection with the evaporator coil and controls visible",
        label: "Thorough system inspection",
      },
      {
        src: "/img/recent-installation-furnace.jpg",
        alt: "Completed American Standard furnace and Aprilaire humidifier installation",
        label: "Ready for the season",
      },
    ],
  },
  investment: {
    eyebrow: "Built To Last",
    title: "Finance real comfort, not a quick patch",
    body: "Flexible payment options can make a properly sized, professionally installed comfort system easier to bring home.",
    images: [
      {
        src: "/img/recent-installation-condenser.jpg",
        alt: "Ameristar outdoor condenser installed on a dedicated equipment pad",
        label: "Outdoor comfort system",
      },
      {
        src: "/img/recent-installation-furnace.jpg",
        alt: "American Standard furnace with whole home Aprilaire humidifier",
        label: "Complete indoor solution",
      },
    ],
  },
  answers: {
    eyebrow: "Real Systems. Clear Answers.",
    title: "We explain what your equipment needs",
    body: "Every recommendation starts with a close look at the full system and a straightforward conversation about the options.",
    images: [
      {
        src: "/img/furnace-coil-service-open.jpg",
        alt: "Open furnace cabinet during HVAC inspection and service",
        label: "Diagnosis before decisions",
      },
      {
        src: "/img/carrier-furnace-install.jpg",
        alt: "Carrier furnace installation photographed by Shadow Heating and Cooling",
        label: "Equipment matched to the home",
      },
    ],
  },
  trust: {
    eyebrow: "Proof In The Work",
    title: "Care you can see on every job",
    body: "Good reviews start with careful work, clean installations, and respect for the homeowner from arrival to final walkthrough.",
    images: [
      {
        src: "/img/installation-brazing-in-progress.jpg",
        alt: "Shadow technician making a refrigerant line connection during installation",
        label: "Skilled field work",
      },
      {
        src: "/img/recent-installation-condenser.jpg",
        alt: "Completed Ameristar air conditioning condenser installation",
        label: "Finished with care",
      },
    ],
  },
  local: {
    eyebrow: "Local And Ready",
    title: "Equipment and expertise brought to your door",
    body: "Shadow serves Hampshire and the surrounding communities with local technicians and the equipment needed to get the job done.",
    images: [
      {
        src: "/img/shadow-service-truck.jpg",
        alt: "Shadow Heating and Cooling service truck delivering new HVAC equipment",
        label: "Serving local homes",
      },
      {
        src: "/img/carrier-furnace-install.jpg",
        alt: "Carrier heating equipment installed by Shadow Heating and Cooling",
        label: "Residential installation",
      },
    ],
  },
  ready: {
    eyebrow: "Your Service Team",
    title: "Ready for repairs, replacements, and maintenance",
    body: "Tell us what is happening. We will bring the right tools, inspect the system, and lay out the next step clearly.",
    images: [
      {
        src: "/img/installation-brazing-in-progress.jpg",
        alt: "Shadow HVAC technician working on a residential system installation",
        label: "Experienced technicians",
      },
      {
        src: "/img/shadow-service-truck.jpg",
        alt: "Shadow Heating and Cooling service truck with HVAC equipment",
        label: "Local response",
      },
    ],
  },
};

export function ProjectProof({ variant }: { variant: ProofVariant }) {
  const proof = proofContent[variant];

  return (
    <Section className="!pt-0">
      <div className="glass-copy grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr,1.2fr] lg:items-center lg:p-10">
        <Reveal>
          <span className="eyebrow mb-5">{proof.eyebrow}</span>
          <h2 className="heading text-3xl leading-tight text-white sm:text-4xl">{proof.title}</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-slate-400">{proof.body}</p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {proof.images.map((image, index) => (
            <Reveal key={image.src} delay={index * 0.08}>
              <figure className="liquid-frame overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  width="1200"
                  height="1200"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {image.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
