import { destinationCards } from "@/lib/mock-data";
import type { CountryId } from "@/lib/calculators";
import { countryGuides } from "@/lib/country-guides";

export interface GlobalGuideArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  content: string;
}

export interface GlobalGuideCountryData {
  title: string;
  subtitle: string;
  articles: GlobalGuideArticle[];
}

export const globalGuideArticlesData: Record<string, GlobalGuideCountryData> = {
  "SAE (Dubaj)": {
    title: "Průvodce investicí v Dubaji",
    subtitle: "Off-plan, non-resident hypotéky a česká zástava",
    articles: [
      {
        id: "dubaj-1",
        category: "Dubaj",
        title: "Jak funguje hypotéka v Dubaji pro cizince",
        excerpt:
          "Non-resident hypotéky, požadavky na příjem a maximální LTV pro zahraniční investory.",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Získat hypotéku v Emirátech jako nerezident (člověk bez lokálního příjmu a Emirates ID) je dnes naprosto standardní proces, má to však svá přísná specifika. Místní banky (např. Emirates NBD nebo DIB) jsou velmi otevřené zahraničnímu kapitálu, ale chrání se nižším LTV.</p>
          <h3>Maximální LTV a akontace</h3>
          <p>Jako nerezident dosáhnete u dubajských bank na maximálně <strong>50 % až 60 % LTV</strong>. To znamená, že musíte mít připraveno zhruba 40–50 % kupní ceny v hotovosti, plus dalších cca 7–8 % na poplatky (4 % DLD, 2 % agentuře, poplatky za odhad a registraci hypotéky).</p>
          <h3>Požadavky na schválení</h3>
          <p>Banky budou požadovat kompletní historii vašeho příjmu z domovské země:</p>
          <ul>
            <li>Výpisy z osobního účtu za posledních 6 měsíců.</li>
            <li>Daňová přiznání z ČR za poslední 2 roky (nutnost soudního překladu).</li>
            <li>Výpis z bankovního registru klientských informací (BRKI), aby banka viděla vaše aktuální zatížení v ČR.</li>
          </ul>
          <p>Dubajské banky často vyžadují, abyste si u nich otevřeli účet a udržovali na něm určitý minimální zůstatek (např. ekvivalent 6 měsíčních splátek).</p>
        `,
      },
      {
        id: "dubaj-2",
        category: "Off-plan",
        title: "Developer Payment Plans",
        excerpt:
          "Jak fungují splátky během výstavby a co se děje po předání klíčů.",
        image:
          "https://images.unsplash.com/photo-1582647509711-c8aa8a8bdef5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>Developer Payment Plans (platební plány přímo od developera) jsou tím hlavním motorem, který pohání dubajský realitní zázrak. Na rozdíl od klasické hypotéky <strong>nepotřebujete schválení banky a neplatíte žádné úroky</strong>. Splácíte nemovitost postupně, tak jak roste.</p>
          <h3>Jak to funguje v praxi?</h3>
          <p>Platební plány se obvykle označují poměrem, například <strong>60/40</strong> nebo <strong>70/30</strong>. První číslo znamená procento, které zaplatíte během výstavby, druhé číslo je částka splatná při předání klíčů (Handover).</p>
          <ul>
            <li><strong>Downpayment (Akontace):</strong> Obvykle 10 % až 20 % při podpisu rezervační smlouvy (+ 4 % DLD poplatek státu).</li>
            <li><strong>Instalments (Splátky):</strong> Například 5 % každé 3 až 4 měsíce, striktně navázané na milníky stavby.</li>
          </ul>
          <h3>Post-handover plány</h3>
          <p>U prémiových projektů můžete narazit i na "Post-handover" plán (např. 50/50, kde 50 % splácíte ještě 2–3 roky PO předání klíčů). Nemovitost už generuje peníze z nájmu, ze kterých hradíte zbylé splátky developerovi.</p>
        `,
      },
      {
        id: "dubaj-3",
        category: "Strategie",
        title: "Americká hypotéka se zástavou v ČR",
        excerpt:
          "Financujte dubajskou nemovitost úvěrem z české banky s ručením českým majetkem.",
        image:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "7 min čtení",
        content: `
          <p>Pro mnoho českých investorů je žádost o hypotéku v Emirátech zbytečně složitá. Efektivnější strategií je neúčelová hypotéka se zástavou nemovitosti v České republice.</p>
          <h3>Mechanika transakce</h3>
          <p>Vlastníte-li v ČR byt v hodnotě 8 milionů Kč bez zástavy, banka může půjčit až 70 % neúčelově v hotovosti — např. 5,5 milionu Kč (cca 870 000 AED).</p>
          <ul>
            <li><strong>Cash Buyer výhoda:</strong> Vyjednávací síla u developerů, sleva 2–5 %.</li>
            <li><strong>Levnější peníze:</strong> České sazby často nižší než u bank v SAE.</li>
            <li><strong>Rychlost:</strong> Schvalování v češtině, platba SWIFT do Dubaje.</li>
          </ul>
          <h3>Na co si dát pozor</h3>
          <p>Kurzové riziko CZK vs. AED/USD — nájem v dirhamech, splátka v korunách. Do modelu započítejte rezervu na výkyvy.</p>
        `,
      },
    ],
  },
  "Španělsko": {
    title: "Průvodce financováním ve Španělsku",
    subtitle: "Americká hypotéka, daně a španělská legislativa",
    articles: [
      {
        id: "spain-1",
        category: "Financování",
        title: "Jak funguje americká hypotéka",
        excerpt:
          "Úvěr vázaný na nemovitost ve Španělsku s českou nebo evropskou zástavou.",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Nejpopulárnější cesta Čechů do Španělska vede přes českou banku. Zastavíte nemovitost v ČR, získáte hotovost a ve Španělsku jednáte jako cash-buyer.</p>
          <h3>Výhody cash-buyer strategie</h3>
          <ul>
            <li>Žádné překlady dokumentů pro španělskou banku.</li>
            <li>Rychlejší uzavření u notáře.</li>
            <li>Možnost vyjednat slevu.</li>
          </ul>
          <h3>Španělská hypotéka</h3>
          <p>Banky financují nerezidenty do 60–70 % LTV. Vyžadují NIE, španělský účet a překlady daňových přiznání.</p>
        `,
      },
      {
        id: "spain-2",
        category: "Daně",
        title: "Daně z nemovitosti v Andalusii",
        excerpt:
          "IBI, převodová daň a specifika regionální legislativy pro zahraniční kupce.",
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>V Andalusii počítejte s ITP 7–10 % u starších nemovitostí nebo IVA u novostaveb.</p>
          <h3>Roční náklady</h3>
          <ul>
            <li><strong>IBI:</strong> Roční daň z nemovitosti obci.</li>
            <li><strong>Comunidad:</strong> Dluhy společenství přecházejí na kupce.</li>
          </ul>
          <p>Transakční náklady nad kupní cenu: <strong>12–13 %</strong>.</p>
        `,
      },
      {
        id: "spain-3",
        category: "Průvodce",
        title: "Proces koupě španělské vily",
        excerpt:
          "Od rezervační smlouvy po zápis v katastru – krok za krokem pro české investory.",
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "8 min čtení",
        content: `
          <p>Proces: NIE → španělský účet → Reserva → Contrato de Arras (10 %) → Escritura u notáře.</p>
          <h3>Due diligence</h3>
          <p>Ověřte zástavní práva, dluhy na comunidad a energetický certifikát. Proces trvá 6–12 týdnů.</p>
        `,
      },
    ],
  },
  "Itálie": {
    title: "Průvodce investicí v Itálii",
    subtitle: "Vysoký výnos, ale specifická pravidla",
    articles: [
      {
        id: "italy-1",
        category: "Itálie",
        title: "Financování vily u jezera",
        excerpt:
          "Specifika italského trhu, notářské poplatky a daň z převodu nemovitosti.",
        image:
          "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Italský trh odměňuje trpělivost a renovaci. Financování pro cizince: LTV 50–60 % u italských bank nebo česká americká hypotéka.</p>
          <h3>Náklady převodu</h3>
          <p>Notářský rogito a daně: 8–12 % ceny nemovitosti.</p>
        `,
      },
      {
        id: "italy-2",
        category: "ROI",
        title: "Výnos z pronájmu v Toskánsku",
        excerpt:
          "Reálné ROI, sezónnost a náklady na správu italské nemovitosti.",
        image:
          "https://images.unsplash.com/photo-1498307832095-e0baa8c4a4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>Hrubý yield 6–8 %, net po správě a IMU kolem 4–5 %. Hlavní sezóna duben–říjen.</p>
          <h3>Správa</h3>
          <p>Agentura bere 20–25 % z obratu. Licence CIR se liší podle obce.</p>
        `,
      },
      {
        id: "italy-3",
        category: "Daně",
        title: "Italská daň z nemovitosti (IMU)",
        excerpt:
          "Kdo platí IMU, jaké jsou sazby a kdy vzniká daňová povinnost pro cizince.",
        image:
          "https://images.unsplash.com/photo-1516483638261-f4dbafecf978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "4 min čtení",
        content: `
          <p>IMU platí vlastník ročně. Codice Fiscale je nutný pro transakce. Příjmy z nájmu deklarujte v ČR jako daňový rezident.</p>
        `,
      },
    ],
  },
  "Chorvatsko": {
    title: "Průvodce investicí v Chorvatsku",
    subtitle: "Nemovitosti u moře pro české investory",
    articles: [
      {
        id: "croatia-1",
        category: "Chorvatsko",
        title: "Koupě domu u Jadranu",
        excerpt:
          "Právní rámec pro EU občany, kupní smlouva a zápis v zemské knize.",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>EU občané kupují bez zvláštního povolení. Euro od 2023 eliminuje měnové riziko.</p>
          <h3>Proces</h3>
          <ul>
            <li>Depozit 10 %, ověření zemljišne knjige.</li>
            <li>Notářský převod, porez na promet 3 %.</li>
          </ul>
        `,
      },
      {
        id: "croatia-2",
        category: "Pronájem",
        title: "Pronájem turistické nemovitosti",
        excerpt:
          "Sezónní výnosy, registrace k pronájmu a místní poplatky pro hostitele.",
        image:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Registrace eVisitor je povinná. Centra měst zpřísňují pravidla pro Airbnb — ověřte licenci.</p>
        `,
      },
      {
        id: "croatia-3",
        category: "Právo",
        title: "EU občané vs. třetí země",
        excerpt:
          "Rozdíly v možnosti koupě nemovitosti podle daňové rezidence kupujícího.",
        image:
          "https://images.unsplash.com/photo-1530521954074-e64f2470ce2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "4 min čtení",
        content: `
          <p>Čeští občané mají stejná práva jako Chorvati. Vždy ověřte legalizaci staveb a přístupovou cestu.</p>
        `,
      },
    ],
  },
  "Bali (Indonésie)": {
    title: "Průvodce investicí na Bali",
    subtitle: "Tropický trh s rostoucím potenciálem pronájmu",
    articles: [
      {
        id: "bali-1",
        category: "Bali",
        title: "Koupě luxusní vily na Bali",
        excerpt:
          "Freehold vs. leasehold, právní struktura pro cizince a bezpečný převod.",
        image:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "7 min čtení",
        content: `
          <p>Cizinci vlastní přes <strong>leasehold</strong> (25–30 let) nebo <strong>PT PMA</strong>.</p>
          <ul>
            <li>Leasehold: jednodušší, časově omezené.</li>
            <li>PT PMA: freehold přes společnost, vyšší náklady.</li>
          </ul>
        `,
      },
      {
        id: "bali-2",
        category: "Výnos",
        title: "ROI z krátkodobého pronájmu",
        excerpt:
          "Sezónnost, Airbnb regulace a reálné výnosy v oblastech Seminyak a Ubud.",
        image:
          "https://images.unsplash.com/photo-1555400038-63f5a51702b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Hrubý yield 10–15 % u prémiových vil. Net po správě: 8–12 %. Sezónní neobsazenost v období dešťů.</p>
        `,
      },
      {
        id: "bali-3",
        category: "Právo",
        title: "Právní rámec pro zahraniční investory",
        excerpt:
          "PT PMA struktura, daňové povinnosti a rizika neověřených developerů.",
        image:
          "https://images.unsplash.com/photo-1518548419970-58e985b343ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>Lokální hypotéka pro cizince prakticky neexistuje. Standard: hotovost nebo česká americká hypotéka.</p>
        `,
      },
    ],
  },
  "Saúdská Arábie": {
    title: "Průvodce investicí v Saúdské Arábii",
    subtitle: "Vision 2030 a nový realitní trh",
    articles: [
      {
        id: "saudi-1",
        category: "SA",
        title: "Saúdský realitní trh pro cizince",
        excerpt:
          "Nové regulace, zóny pro zahraniční vlastnictví a perspektivní lokality.",
        image:
          "https://images.unsplash.com/photo-1616348436168-de43ad0db179?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Vlastnictví povoleno jen ve vyjmenovaných zónách. Klíčové lokality: Rijád, Jeddah, NEOM.</p>
        `,
      },
      {
        id: "saudi-2",
        category: "Projekty",
        title: "Mega projekty: NEOM a Rijád",
        excerpt:
          "Investiční příležitosti v rámci největších stavebních projektů na světě.",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>NEOM je spekulativní s dlouhým horizontem. Rijád nabízí konzervativnější fundamentální poptávku.</p>
        `,
      },
      {
        id: "saudi-3",
        category: "Daně",
        title: "Daně a poplatky při koupi",
        excerpt:
          "Transfer tax, poplatky za registraci a daňové aspekty pro nerezidenty.",
        image:
          "https://images.unsplash.com/photo-1581020088033-685b882eb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "4 min čtení",
        content: `
          <p>SAR fixní vůči USD. Transfer tax a registrační poplatky při koupi. Koupě pro dlouhodobé investory s tolerancí rizika.</p>
        `,
      },
    ],
  },
  "Slovensko": {
    title: "Průvodce investicí na Slovensku",
    subtitle: "Blízký trh s českou legislativní podobností",
    articles: [
      {
        id: "sk-1",
        category: "Slovensko",
        title: "Investice v Bratislavě",
        excerpt:
          "Rostoucí poptávka po nájmu, nová výstavba a dostupnost pro české investory.",
        image:
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>Bratislava táhne růst s IT sektorem. Yield 4–5 %, nižší vstupní ceny než Praha.</p>
        `,
      },
      {
        id: "sk-2",
        category: "Turistika",
        title: "Chalupy a apartmány v Tatranské oblasti",
        excerpt:
          "Sezónní pronájem, správa na dálku a daňové aspekty pro české majitele.",
        image:
          "https://images.unsplash.com/photo-1519677100203-a0e668c92439?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "5 min čtení",
        content: `
          <p>Vysoké Tatry: sezónní pronájem, správa 15–20 % z obratu. Příjmy deklarujte v ČR.</p>
        `,
      },
      {
        id: "sk-3",
        category: "Financování",
        title: "Hypotéka na Slovensku pro Čechy",
        excerpt:
          "Podmínky slovenských bank, LTV limity a co připravit k žádosti.",
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        readTime: "6 min čtení",
        content: `
          <p>Slovenské banky financují EU občany do 80–90 % LTV. Alternativa: česká hypotéka na SK nemovitost s překlady dokumentů.</p>
        `,
      },
    ],
  },
};

const countryNameById = Object.fromEntries(
  destinationCards.map((card) => [card.id, card.name])
) as Record<CountryId, string>;

export function getGlobalGuideData(
  countryId: CountryId
): GlobalGuideCountryData | null {
  if (countryId === "cz") return null;
  const name = countryNameById[countryId];
  return globalGuideArticlesData[name] ?? null;
}

export function getGlobalGuideRedFlags(countryId: CountryId) {
  return countryGuides[countryId]?.redFlags ?? [];
}
