import {
  Flame,
  Snowflake,
  Wind,
  ShieldCheck,
  Siren,
  Gauge,
  Wrench,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import type { Service } from "@/lib/site";

const map: Record<Service["icon"], LucideIcon> = {
  flame: Flame,
  snowflake: Snowflake,
  wind: Wind,
  shield: ShieldCheck,
  siren: Siren,
  gauge: Gauge,
  wrench: Wrench,
  leaf: Leaf,
};

export function ServiceIcon({
  icon,
  className = "h-6 w-6",
}: {
  icon: Service["icon"];
  className?: string;
}) {
  const Icon = map[icon];
  return <Icon className={className} />;
}
