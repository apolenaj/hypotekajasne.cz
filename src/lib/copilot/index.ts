export * from "@/lib/copilot/types";
export * from "@/lib/copilot/intents";
export * from "@/lib/copilot/citations";
export * from "@/lib/copilot/context";
export * from "@/lib/copilot/guardrails";
export * from "@/lib/copilot/audit";
export { orchestrateCopilot } from "@/lib/copilot/orchestrate";

export const COPILOT_QUICK_ACTIONS: {
  id: import("@/lib/copilot/types").CopilotQuickActionId;
  label: string;
  prompt: string;
}[] = [
  {
    id: "affordability",
    label: "Spočítat dostupnost",
    prompt: "Kolik si můžeme bezpečně dovolit?",
  },
  {
    id: "compare_properties",
    label: "Porovnat nemovitosti",
    prompt: "Porovnej uložené nemovitosti.",
  },
  {
    id: "risk_analysis",
    label: "Analyzovat riziko",
    prompt: "Analyzuj rizika mého profilu včetně stress testu sazby +2 %.",
  },
  {
    id: "action_plan",
    label: "Připravit akční plán",
    prompt: "Připrav mi akční plán.",
  },
  {
    id: "explain_score",
    label: "Vysvětlit výsledek",
    prompt: "Proč mi vyšlo toto skóre připravenosti?",
  },
  {
    id: "contact_specialist",
    label: "Kontaktovat specialistu",
    prompt: "Chci kontaktovat specialistu.",
  },
];
