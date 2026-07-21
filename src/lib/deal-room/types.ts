import type { CountryId } from "@/lib/calculators";
import type { ClaimKind } from "@/lib/property-rentgen/types";

export const DEAL_ROOM_STORAGE_KEY = "hj-deal-room-v1";
export const DEAL_ROOM_FEATURE_STATUS = "BETA" as const;

export const DEAL_ROOM_SECTION_IDS = [
  "property",
  "financing",
  "analysis",
  "documents",
  "questions",
  "offers",
  "timeline",
  "contacts",
  "tasks",
] as const;

export type DealRoomSectionId = (typeof DEAL_ROOM_SECTION_IDS)[number];

export const DEAL_ROOM_SECTION_LABELS: Record<DealRoomSectionId, string> = {
  property: "Nemovitost",
  financing: "Financování",
  analysis: "Analýza",
  documents: "Dokumenty",
  questions: "Dotazy",
  offers: "Nabídky",
  timeline: "Časová osa",
  contacts: "Kontakty",
  tasks: "Úkoly",
};

export const DEAL_ROOM_ROLES = [
  "user",
  "hypoteka_jasne",
  "majetio",
  "mortgage_specialist",
  "agent_developer",
  "lawyer",
] as const;

export type DealRoomRole = (typeof DEAL_ROOM_ROLES)[number];

export const DEAL_ROOM_ROLE_LABELS: Record<DealRoomRole, string> = {
  user: "Kupující (vy)",
  hypoteka_jasne: "Hypotéka Jasně",
  majetio: "Majetio",
  mortgage_specialist: "Hypoteční specialista",
  agent_developer: "Makléř / developer",
  lawyer: "Právník",
};

export const TIMELINE_STEP_IDS = [
  "property_selected",
  "analysis_complete",
  "viewing",
  "offer",
  "reservation",
  "financing",
  "valuation",
  "legal_review",
  "contract",
  "land_registry",
  "handover",
] as const;

export type TimelineStepId = (typeof TIMELINE_STEP_IDS)[number];

export const TIMELINE_STEP_LABELS: Record<TimelineStepId, string> = {
  property_selected: "Nemovitost vybrána",
  analysis_complete: "Analýza dokončena",
  viewing: "Prohlídka",
  offer: "Nabídka",
  reservation: "Rezervace",
  financing: "Financování",
  valuation: "Ocenění / znalecký posudek",
  legal_review: "Právní prověrka",
  contract: "Smlouva",
  land_registry: "Katastr",
  handover: "Předání",
};

export type TimelineStepStatus =
  | "pending"
  | "in_progress"
  | "waiting"
  | "completed"
  | "blocked";

export type DealRoomContact = {
  role: DealRoomRole;
  label: string;
  email: string | null;
  phone: string | null;
  connected: boolean;
};

export type DealRoomDocumentRef = {
  id: string;
  label: string;
  vaultDocumentId: string | null;
  visibleToRoles: DealRoomRole[];
  claimKind: ClaimKind;
};

export type DocumentSharePermission = {
  id: string;
  documentId: string;
  fromRole: DealRoomRole;
  toRole: DealRoomRole;
  grantedBy: DealRoomRole;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  consentNote: string;
};

export type TimelineStep = {
  id: TimelineStepId;
  label: string;
  status: TimelineStepStatus;
  owner: DealRoomRole;
  dueAt: string | null;
  completedAt: string | null;
  requiredDocuments: string[];
  notes: string | null;
  claimKind: ClaimKind;
};

export type DealRoomQuestion = {
  id: string;
  text: string;
  authorRole: DealRoomRole;
  createdAt: string;
  answered: boolean;
  answer: string | null;
};

export type DealRoomOffer = {
  id: string;
  amount: number | null;
  currency: string;
  status: "draft" | "submitted" | "counter" | "accepted" | "rejected";
  submittedAt: string | null;
  claimKind: ClaimKind;
};

export type DealRoomTask = {
  id: string;
  title: string;
  owner: DealRoomRole;
  dueAt: string | null;
  done: boolean;
  section: DealRoomSectionId;
};

export type DealRoomProperty = {
  title: string;
  address: string;
  country: CountryId;
  priceCzk: number | null;
  majetioListingRef: string | null;
  listingUrl: string | null;
};

export type DealRoomWorkspace = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "paused" | "closed";
  seriousInterestAt: string;
  property: DealRoomProperty;
  timeline: TimelineStep[];
  contacts: DealRoomContact[];
  documents: DealRoomDocumentRef[];
  sharePermissions: DocumentSharePermission[];
  questions: DealRoomQuestion[];
  offers: DealRoomOffer[];
  tasks: DealRoomTask[];
  financingRouteRef: string | null;
  analysisRef: string | null;
};

export type DealRoomNowSummary = {
  happeningNow: string;
  waitingFor: string;
  whoseTurn: DealRoomRole;
  whoseTurnLabel: string;
  activeStep: TimelineStep | null;
};

export type DealRoomDashboard = {
  generatedAt: string;
  workspace: DealRoomWorkspace;
  now: DealRoomNowSummary;
  methodology: string[];
};

export type DealRoomStore = {
  version: 1;
  workspaces: DealRoomWorkspace[];
  activeWorkspaceId: string | null;
};

export type CreateDealRoomInput = {
  propertyTitle: string;
  propertyAddress: string;
  country: CountryId;
  priceCzk?: number | null;
  majetioListingRef?: string | null;
  listingUrl?: string | null;
};

export function emptyDealRoomStore(): DealRoomStore {
  return { version: 1, workspaces: [], activeWorkspaceId: null };
}
