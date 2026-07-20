import { appendB2bAudit } from "@/lib/b2b-portal/audit";
import type { B2bPortalStore, QualifiedInterestLead } from "@/lib/b2b-portal/types";

export function recordQualifiedInterest(input: {
  store: B2bPortalStore;
  analysisOrderId: string;
  orgId: string;
  memberId: string;
  consentId: string;
  consentText: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  interestType: QualifiedInterestLead["interestType"];
}): { store: B2bPortalStore; lead: QualifiedInterestLead } {
  const lead: QualifiedInterestLead = {
    id: `lead_${Date.now().toString(36)}`,
    analysisOrderId: input.analysisOrderId,
    orgId: input.orgId,
    consentId: input.consentId,
    consentGrantedAt: new Date().toISOString(),
    consentText: input.consentText,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone ?? null,
    interestType: input.interestType,
    status: "new",
    at: new Date().toISOString(),
  };

  appendB2bAudit({
    orgId: input.orgId,
    actorMemberId: input.memberId,
    action: "interest_received",
    resourceType: "qualified_interest",
    resourceId: lead.id,
    metadata: { consentId: input.consentId, interestType: input.interestType },
  });

  return {
    store: {
      ...input.store,
      qualifiedInterests: {
        ...input.store.qualifiedInterests,
        [lead.id]: lead,
      },
    },
    lead,
  };
}

export function listInterestsForOrg(
  store: B2bPortalStore,
  orgId: string
): QualifiedInterestLead[] {
  return Object.values(store.qualifiedInterests)
    .filter((l) => l.orgId === orgId)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
