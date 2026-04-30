import type { JSX } from "react";
import {
  Home,
  List,
  PieChart,
  CreditCard,
  Target,
  Search,
  Bell,
  Plus,
  Menu,
  User,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Calendar,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const REGISTRY = {
  home: Home,
  list: List,
  pie: PieChart,
  card: CreditCard,
  target: Target,
  search: Search,
  bell: Bell,
  plus: Plus,
  menu: Menu,
  user: User,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  close: X,
  filter: Filter,
  calendar: Calendar,
  cog: Settings,
  wallet: Wallet,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof REGISTRY;

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className,
  "aria-label": ariaLabel,
}: IconProps): JSX.Element {
  const Component = REGISTRY[name];
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  );
}
