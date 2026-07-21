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
      "Transakční místnost sjednocuje komunikaci, úkoly a dokumenty na jednom místě.",
      "Dokumenty se mezi rolemi nesdílí automaticky — jen po výslovném udělení oprávnění.",
      "Kroky časové osy mají vlastníka, termín a požadované dokumenty (orientační checklist).",
      "Hypotéka Jasně, Majetio, specialista, makléř a právník jsou propojitelné kontakty.",
      "Citlivé dokumenty zůstávají v dokumentovém trezoru — transakční místnost drží jen odkazy a oprávnění.",
    ],
  };
}
