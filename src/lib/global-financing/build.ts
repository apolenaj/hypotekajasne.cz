import { countryConfigs } from "@/lib/calculators";
import { buildFinancingRoutes } from "@/lib/global-financing/build-routes";
import { residencyLabel } from "@/lib/global-financing/route-metadata";
import type {
  FinancingMapEdge,
  FinancingMapNode,
  FinancingRouteCard,
  GlobalFinancingMap,
  GlobalFinancingRouterInput,
} from "@/lib/global-financing/types";

function buildMapGraph(
  input: GlobalFinancingRouterInput,
  routes: FinancingRouteCard[],
  originLabel: string,
  destinationLabel: string
): { nodes: FinancingMapNode[]; edges: FinancingMapEdge[] } {
  const nodes: FinancingMapNode[] = [
    {
      id: "origin",
      type: "origin",
      label: originLabel,
      sublabel: residencyLabel(input.residency),
    },
    {
      id: "destination",
      type: "destination",
      label: destinationLabel,
      sublabel: countryConfigs[input.propertyCountry].currency,
    },
  ];
  const edges: FinancingMapEdge[] = [];

  for (const route of routes) {
    const nodeId = route.routeId;
    nodes.push({
      id: nodeId,
      type: "route",
      label: `Route ${route.routeLetter}`,
      sublabel: route.label,
      routeCard: route,
    });
    edges.push({
      from: "origin",
      to: nodeId,
      label: null,
    });
    edges.push({
      from: nodeId,
      to: "destination",
      label: route.pathType,
    });
  }

  return { nodes, edges };
}

export function buildGlobalFinancingMap(
  input: GlobalFinancingRouterInput,
  now: Date = new Date()
): GlobalFinancingMap {
  const routes = buildFinancingRoutes(input);
  const originLabel = residencyLabel(input.residency);
  const destinationLabel = `Nemovitost — ${countryConfigs[input.propertyCountry].label}`;
  const { nodes, edges } = buildMapGraph(
    input,
    routes,
    originLabel,
    destinationLabel
  );

  return {
    generatedAt: now.toISOString(),
    input,
    originLabel,
    destinationLabel,
    routes,
    nodes,
    edges,
    methodology: [
      "Router nevybírá jednu „nejlepší“ hypotéku — zobrazuje možné cesty.",
      "Lokální sazby v zahraničí nepočítáme bez ověřeného zdroje.",
      "České zajištěné financování vyžaduje zástavu v ČR.",
      "Partner bez integrace = individuální ověření u specialisty.",
      "Kombinace je orientační struktura, ne jeden bankovní produkt.",
    ],
    noSingleRecommendation: true,
  };
}
