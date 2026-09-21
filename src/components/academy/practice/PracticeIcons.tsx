import {
  Briefcase,
  HeartPulse,
  Landmark,
  Percent,
  Receipt,
  RefreshCw,
  Route,
  ShieldAlert,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { PracticeGuide } from "@/lib/academy/practice/types";

export const PRACTICE_ICONS: Record<PracticeGuide["icon"], LucideIcon> = {
  route: Route,
  wallet: Wallet,
  landmark: Landmark,
  briefcase: Briefcase,
  shieldAlert: ShieldAlert,
  percent: Percent,
  refreshCw: RefreshCw,
  heartPulse: HeartPulse,
  users: Users,
  receipt: Receipt,
};
