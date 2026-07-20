import { buildNowSummary } from "@/lib/deal-room/create";
import type { DealRoomDashboard, DealRoomWorkspace } from "@/lib/deal-room/types";

export function buildDealRoomDashboard(
  workspace: DealRoomWorkspace,
  now: Date = new Date()
): DealRoomDashboard {
  const summary = buildNowSummary(workspace);

  return {
    generatedAt: now.toISOString(),
    workspace,
    now: summary,
    methodology: [
      "Deal Room nahrazuje chaos z WhatsAppu, e-mailů a PDF příloh jedním workspace.",
      "Dokumenty se mezi rolemi nesdílí automaticky — jen explicitní permission model.",
      "Timeline kroky mají ownera, termín a požadované dokumenty (MODEL checklist).",
      "Hypotéka Jasně, Majetio, specialista, makléř a právník jsou propojitelné kontakty.",
      "Citlivé dokumenty zůstávají ve Vault — Deal Room drží jen refs a permissions.",
    ],
  };
}
