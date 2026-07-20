import { createDealRoomWorkspace } from "@/lib/deal-room/create";

export const DEMO_DEAL_ROOM = createDealRoomWorkspace({
  propertyTitle: "Byt 3+kk — Vinohrady, Praha",
  propertyAddress: "Korunní 123, Praha 2",
  country: "cz",
  priceCzk: 8_900_000,
  majetioListingRef: "demo_listing_vinohrady",
  listingUrl: "https://majetio.cz",
});

export function seedDemoDealRoomDocuments(
  workspace: typeof DEMO_DEAL_ROOM
): typeof DEMO_DEAL_ROOM {
  return {
    ...workspace,
    documents: [
      {
        id: "dr_doc_analysis",
        label: "Investiční rentgen — souhrn",
        vaultDocumentId: null,
        visibleToRoles: ["user", "hypoteka_jasne"],
        claimKind: "MODEL",
      },
      {
        id: "dr_doc_reservation",
        label: "Rezervační smlouva (draft)",
        vaultDocumentId: null,
        visibleToRoles: ["user"],
        claimKind: "NEOVERENO",
      },
    ],
    questions: [
      {
        id: "q1",
        text: "Je byt v družstevním vlastnictví nebo OV?",
        authorRole: "user",
        createdAt: workspace.createdAt,
        answered: false,
        answer: null,
      },
    ],
    offers: [
      {
        id: "offer_1",
        amount: 8_750_000,
        currency: "CZK",
        status: "draft",
        submittedAt: null,
        claimKind: "MODEL",
      },
    ],
    analysisRef: "/investicni-rentgen",
    financingRouteRef: "/globalni-financovani",
  };
}

export const DEMO_DEAL_ROOM_SEEDED = seedDemoDealRoomDocuments(DEMO_DEAL_ROOM);
