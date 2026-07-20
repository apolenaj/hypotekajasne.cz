import {
  assemble,
  ctaSection,
  modelledClaim,
  narrative,
  reviewClaim,
  sectionTitle,
  sourcesSection,
} from "@/lib/country-dossier/build";
import {
  CNB_INVESTMENT_CLAIM,
  CNB_OWNER_OCCUPIED_CLAIM,
  LEGAL_REVIEW_AS_OF,
  TITLE_TRANSFER_CZ_CLAIM,
} from "@/lib/country-dossier/shared";
import type { CountryDossier } from "@/lib/country-dossier/types";

export const czDossier: CountryDossier = assemble(
  "cz",
  "Česká republika",
  "Domácí trh s transparentním katastrem, ČNB doporučeními a živými sazbami bank.",
  [
    narrative("executive_summary", "Stabilní EU trh s předvídatelným právním rámcem a širokou nabídkou bankovních produktů.", [
      { text: "Vhodný jako základ portfolia i vlastní bydlení — ne jako „bezriziková jistota výnosu“." },
      { text: CNB_OWNER_OCCUPIED_CLAIM.text, claim: CNB_OWNER_OCCUPIED_CLAIM },
      { text: CNB_INVESTMENT_CLAIM.text, claim: CNB_INVESTMENT_CLAIM },
    ]),
    narrative("suitability", "Pro koho dává ČR smysl", [
      { text: "Rezidenti a daňoví rezidenti ČR s dokumentovaným příjmem." },
      { text: "Investoři hledající likvidnější trh v CZK bez FX rizika vůči korunovým závazkům." },
      { text: "Méně vhodné jako spekulace na krátký horizont bez rezervy na holding costs." },
    ]),
    {
      id: "ownership",
      kind: "ownership",
      title: sectionTitle("ownership"),
      summary: "Freehold zápisem do katastru nemovitostí.",
      modelLabel: "Freehold (katastr)",
      bullets: [
        { text: TITLE_TRANSFER_CZ_CLAIM.text, claim: TITLE_TRANSFER_CZ_CLAIM },
        { text: "Vlastnické právo vzniká zápisem do katastru, nikoli samotným podpisem smlouvy." },
      ],
    },
    {
      id: "financing",
      kind: "financing",
      title: sectionTitle("financing"),
      summary: "Rezident i nerezident s příjmem v ČR — klasická hypotéka a americká hypotéka. Bez marketingových „triků“.",
      lanes: [
        {
          audience: "resident",
          title: "Klasická hypoteční úvěr",
          summary: CNB_OWNER_OCCUPIED_CLAIM.text,
          linkedOptions: ["LOCAL_MORTGAGE"],
          claim: CNB_OWNER_OCCUPIED_CLAIM,
        },
        {
          audience: "both",
          title: "Investiční financování",
          summary: CNB_INVESTMENT_CLAIM.text,
          linkedOptions: ["LOCAL_MORTGAGE"],
          claim: CNB_INVESTMENT_CLAIM,
        },
        {
          audience: "both",
          title: "Dozajištění další nemovitostí",
          summary:
            "Banky mohou při dostatečné zástavní hodnotě (kupovaná + další nemovitost) akceptovat vyšší podíl úvěru vůči kupní ceně. Nejde o garantované „100% financování“ — vždy individuální posouzení LTV, bonity a zástav.",
          linkedOptions: ["LOCAL_MORTGAGE"],
          claim: {
            text: "Dozajištění snižuje LTV vůči souhrnu zástav; neznamená automatické schválení ani obcházení doporučení ČNB.",
            source: "Běžná úvěrová praxe CZ bank",
            sourceUrl: null,
            asOf: LEGAL_REVIEW_AS_OF,
            status: "MODELLED",
            notes: "Podmínky se liší banka od banky.",
          },
        },
        {
          audience: "both",
          title: "Hotovost",
          summary: "Nákup bez úvěru — stále platí katastr a úschova kupní ceny.",
          linkedOptions: ["CASH"],
        },
      ],
    },
    {
      id: "transaction_costs",
      kind: "costs",
      title: sectionTitle("transaction_costs"),
      summary: "Nad kupní cenu počítejte s daněmi/poplatky a právní úschovou.",
      lines: [
        {
          label: "Daň z nabytí",
          range: "od 2016 neplatí kupující (historický kontext)",
          claim: reviewClaim(
            "Daň z nabytí nemovitých věcí byla zrušena; ověřte aktuální daňový režim u poradce.",
            "MF ČR / daňové předpisy"
          ),
        },
        {
          label: "Právní služby + úschova",
          range: "orientačně 10–25 tis. Kč+",
          claim: modelledClaim(
            "Cena závisí na složitosti transakce a poskytovateli (advokát / notář / banka).",
            "Tržní praxe ČR"
          ),
        },
        {
          label: "Katastrální poplatky",
          range: "řádově stovky až tisíce Kč",
          claim: modelledClaim("Podle typu návrhu na vklad.", "ČÚZK praxe"),
        },
      ],
    },
    {
      id: "holding_costs",
      kind: "costs",
      title: sectionTitle("holding_costs"),
      summary: "Roční náklady držení — daň z nemovitých věcí, SVJ, pojištění, údržba.",
      lines: [
        {
          label: "Daň z nemovitých věcí",
          range: "obecní sazby — individuálně",
          claim: reviewClaim(
            "Daň z nemovitých věcí spravují obce; výše není univerzální.",
            "Zákon o dani z nemovitých věcí"
          ),
        },
        {
          label: "SVJ / správa + pojištění",
          range: "tisíce Kč / měsíc podle lokality",
          claim: modelledClaim("Orientační pásmo, ne nabídka.", "Tržní praxe"),
        },
      ],
    },
    narrative("rental_tax", "Příjem z nájmu podléhá dani z příjmů — režim závisí na způsobu uplatnění výdajů.", [
      {
        text: "Fyzické osoby typicky volí skutečné výdaje nebo paušál — konkrétní sazba a odpočty ověřte u daňového poradce.",
        claim: reviewClaim(
          "Zdanění nájmu se řídí zákonem o daních z příjmů; není jednotná „sazba pro všechny“.",
          "ZDP / Finanční správa"
        ),
      },
    ]),
    narrative("exit", "Prodej probíhá smluvně + vkladem do katastru; likvidita se liší lokalitou a cenou.", [
      { text: "Čas na prodej a sleva z inzerované ceny jsou tržní, ne garantované." },
      { text: "Daňové dopady prodeje (časový test / výjimky) ověřte individuálně." },
    ]),
    narrative("inheritance", "Dědické řízení podle českého práva; cizí prvek řeší mezinárodní právo soukromé.", [
      {
        text: "Pro přeshraniční majetek doporučujeme testamentární a daňové plánování s odborníkem.",
        claim: reviewClaim(
          "Dědické právo ČR nezbavuje nutnosti řešit zahraniční aktiva podle místních pravidel.",
          "Občanský zákoník — dědění"
        ),
      },
    ]),
    narrative("fx_risk", "Pro investora v CZK je FX riziko nízké u domácí nemovitosti.", [
      { text: "Riziko vzniká, pokud máte příjmy/závazky v jiné měně než CZK." },
    ]),
    narrative("developer_risk", "U novostaveb a off-plan platí riziko delay / kvality developera.", [
      { text: "Ověřte historii developera, bankovní úschovu a stav projektu — „známá značka“ není záruka." },
    ]),
    narrative("short_term_rentals", "Krátkodobé nájmy mohou podléhat regulaci obce a SVJ.", [
      {
        text: "Praha a další města mohou omezovat Airbnb-typ provozu; vždy ověřte stanovy SVJ a místní vyhlášky.",
        claim: modelledClaim(
          "Regulace je lokální a mění se — není celostátní absolutní zákaz ani absolutní volnost.",
          "Obecní vyhlášky / SVJ praxe"
        ),
      },
    ]),
    {
      id: "purchase_timeline",
      kind: "timeline",
      title: sectionTitle("purchase_timeline"),
      summary: "Typický průběh — individuální odchylky podle financování a katastru.",
      steps: [
        { order: 1, title: "Rezervace / due diligence", detail: "Prověrka listu vlastnictví, dluhů, SVJ.", durationHint: "1–3 týdny" },
        { order: 2, title: "Financování", detail: "Odhad, schválení úvěru nebo příprava hotovosti.", durationHint: "2–6 týdnů" },
        {
          order: 3,
          title: "Smlouva + úschova",
          detail: "Kupní smlouva a úschova (advokát / notář / banka).",
          durationHint: "1–2 týdny",
          claim: TITLE_TRANSFER_CZ_CLAIM,
        },
        { order: 4, title: "Návrh na vklad", detail: "Podání na katastr, čekání na zápis.", durationHint: "cca 20–30 dnů+" },
        { order: 5, title: "Předání", detail: "Protokol, měřiče, pojištění.", durationHint: "dle dohody" },
      ],
    },
    {
      id: "red_flags",
      kind: "flags",
      title: sectionTitle("red_flags"),
      summary: "Signály k zastavení nebo zpomalení transakce.",
      flags: [
        { severity: "high", text: "Platba přímo prodávajícímu mimo úschovu." },
        { severity: "high", text: "Nesoulad listu vlastnictví / věcná břemena bez vysvětlení." },
        { severity: "medium", text: "Slib „jisté schválení“ úvěru bez podkladů banky." },
        { severity: "info", text: "LTV nad rámcem doporučení ČNB — možné, ale přísnější posouzení." },
      ],
    },
    sourcesSection(
      {
        text: `Poslední právní review dossieru ČR: ${LEGAL_REVIEW_AS_OF}`,
        source: "HypotékaJasně.cz editorial legal review",
        sourceUrl: null,
        asOf: LEGAL_REVIEW_AS_OF,
        status: "VERIFIED",
      },
      [CNB_OWNER_OCCUPIED_CLAIM, CNB_INVESTMENT_CLAIM, TITLE_TRANSFER_CZ_CLAIM]
    ),
    ctaSection("cz"),
  ]
);
