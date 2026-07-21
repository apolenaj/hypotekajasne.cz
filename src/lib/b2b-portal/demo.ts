import type {
  B2bMember,
  B2bOrganization,
  B2bPortalStore,
  DeveloperProject,
} from "@/lib/b2b-portal/types";

export const DEMO_AGENT_ORG: B2bOrganization = {
  id: "org_agent_demo",
  type: "real_estate_agent",
  name: "Jan Novák — realitní makléř",
  ico: null,
  contactEmail: "jan.novak@example.cz",
  whiteLabelLogoUrl: null,
  createdAt: "2026-06-01T00:00:00.000Z",
  billingCustomerId: "cus_beta_demo_agent",
  activePlanId: null,
};

export const DEMO_AGENCY_ORG: B2bOrganization = {
  id: "org_agency_demo",
  type: "agency",
  name: "Premium Reality s.r.o.",
  ico: "12345678",
  contactEmail: "office@premium-reality.example",
  whiteLabelLogoUrl: null,
  createdAt: "2026-05-15T00:00:00.000Z",
  billingCustomerId: "cus_beta_demo_agency",
  activePlanId: "package_starter",
};

export const DEMO_DEVELOPER_ORG: B2bOrganization = {
  id: "org_developer_demo",
  type: "developer",
  name: "Urban Living Development a.s.",
  ico: "87654321",
  contactEmail: "sales@urbanliving.example",
  whiteLabelLogoUrl: null,
  createdAt: "2026-04-01T00:00:00.000Z",
  billingCustomerId: "cus_beta_demo_dev",
  activePlanId: null,
};

export const DEMO_MORTGAGE_ORG: B2bOrganization = {
  id: "org_mortgage_demo",
  type: "mortgage_partner",
  name: "Hypo Partner s.r.o.",
  ico: "11223344",
  contactEmail: "b2b@hypopartner.example",
  whiteLabelLogoUrl: null,
  createdAt: "2026-03-01T00:00:00.000Z",
  billingCustomerId: "cus_beta_demo_mortgage",
  activePlanId: null,
};

export const DEMO_MEMBERS: B2bMember[] = [
  {
    id: "mem_agent",
    orgId: DEMO_AGENT_ORG.id,
    displayName: "Jan Novák",
    email: "jan.novak@example.cz",
    role: "org_owner",
    joinedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "mem_agency_admin",
    orgId: DEMO_AGENCY_ORG.id,
    displayName: "Marie Procházková",
    email: "marie@premium-reality.example",
    role: "org_admin",
    joinedAt: "2026-05-15T00:00:00.000Z",
  },
  {
    id: "mem_dev_pm",
    orgId: DEMO_DEVELOPER_ORG.id,
    displayName: "Tomáš Urban",
    email: "tomas@urbanliving.example",
    role: "developer_pm",
    joinedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "mem_mortgage",
    orgId: DEMO_MORTGAGE_ORG.id,
    displayName: "Petra Hypo",
    email: "petra@hypopartner.example",
    role: "finance_partner",
    joinedAt: "2026-03-01T00:00:00.000Z",
  },
];

export const DEMO_DEVELOPER_PROJECT: DeveloperProject = {
  id: "proj_rezidence_vltava",
  orgId: DEMO_DEVELOPER_ORG.id,
  name: "Rezidence Vltava",
  city: "Praha 8",
  phase: "presale",
  updatedAt: "2026-07-01T00:00:00.000Z",
  units: [
    {
      id: "unit_a1",
      projectId: "proj_rezidence_vltava",
      label: "A1 — 2+kk",
      floor: 1,
      areaM2: 52,
      priceCzk: 6_890_000,
      status: "available",
      availabilityUpdatedAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "unit_b3",
      projectId: "proj_rezidence_vltava",
      label: "B3 — 3+kk",
      floor: 3,
      areaM2: 68,
      priceCzk: 8_450_000,
      status: "reserved",
      availabilityUpdatedAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "unit_c5",
      projectId: "proj_rezidence_vltava",
      label: "C5 — 4+kk",
      floor: 5,
      areaM2: 85,
      priceCzk: 10_200_000,
      status: "sold",
      availabilityUpdatedAt: "2026-06-15T00:00:00.000Z",
    },
  ],
  paymentPlans: [
    {
      id: "plan_standard",
      projectId: "proj_rezidence_vltava",
      name: "Standardní platební plán",
      disclaimer: "Orientační model — finální podmínky ve smlouvě s developerem.",
      installments: [
        {
          dueAt: "2026-08-01",
          amountCzk: 689_000,
          label: "Rezervační záloha 10 %",
          claimKind: "partner_provided",
        },
        {
          dueAt: "2027-01-01",
          amountCzk: 2_067_000,
          label: "Po kolaudaci 30 %",
          claimKind: "partner_provided",
        },
        {
          dueAt: "2027-06-01",
          amountCzk: 4_134_000,
          label: "Doplatek 60 %",
          claimKind: "partner_provided",
        },
      ],
    },
  ],
  documents: [
    {
      id: "doc_standar",
      projectId: "proj_rezidence_vltava",
      title: "Standard bytu — typ A",
      docType: "standard",
      url: null,
      provenance: "partner_provided",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "doc_energy",
      projectId: "proj_rezidence_vltava",
      title: "Penb — energetický štítek (vzor)",
      docType: "energy",
      url: null,
      provenance: "independent_data",
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ],
  financingOptions: [
    {
      id: "fin_hypo_a",
      projectId: "proj_rezidence_vltava",
      lenderLabel: "Partnerská banka A",
      maxLtvPercent: 80,
      rateFromPercent: 4.79,
      verifiedAt: "2026-06-15T00:00:00.000Z",
      provenance: "partner_provided",
      sponsored: true,
      disclaimer: "Ověřená nabídka partnera — ne individuální schválení.",
    },
    {
      id: "fin_hypo_b",
      projectId: "proj_rezidence_vltava",
      lenderLabel: "Partnerská banka B",
      maxLtvPercent: 85,
      rateFromPercent: 4.99,
      verifiedAt: "2026-06-20T00:00:00.000Z",
      provenance: "partner_provided",
      sponsored: false,
      disclaimer: "Orientační — ověřte u specialisty.",
    },
  ],
};

export function seedDemoB2bStore(store: B2bPortalStore): B2bPortalStore {
  if (Object.keys(store.organizations).length > 0) return store;

  const orgs = {
    [DEMO_AGENT_ORG.id]: DEMO_AGENT_ORG,
    [DEMO_AGENCY_ORG.id]: DEMO_AGENCY_ORG,
    [DEMO_DEVELOPER_ORG.id]: DEMO_DEVELOPER_ORG,
    [DEMO_MORTGAGE_ORG.id]: DEMO_MORTGAGE_ORG,
  };
  const members = Object.fromEntries(DEMO_MEMBERS.map((m) => [m.id, m]));

  return {
    ...store,
    activeOrgId: DEMO_AGENT_ORG.id,
    activeMemberId: DEMO_MEMBERS[0]!.id,
    organizations: orgs,
    members,
    developerProjects: {
      [DEMO_DEVELOPER_PROJECT.id]: DEMO_DEVELOPER_PROJECT,
    },
  };
}
