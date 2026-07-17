export interface CountryTaxItem {
  name: string;
  value: string;
}

export interface CountryInfoEntry {
  overview: string[];
  taxes: CountryTaxItem[];
}

export const COUNTRY_INFO_DATA: Record<string, CountryInfoEntry> = {
  "Česká republika": {
    overview: [
      "Konzervativní a vysoce stabilní trh s nulovým měnovým rizikem (pro lidi vydělávající v CZK).",
      "Silná právní ochrana; u vlastního bydlení LTV obvykle do 80 % (do 36 let až 90 %). U investičních hypoték ČNB od 4/2026 doporučuje LTV max. 70 % a DTI 7.",
      "Výnosy z dlouhodobého nájmu se pohybují kolem 3–5 % p.a. (v Praze méně, v regionech jako Ostrava/Ústí nad Labem více).",
      "Trh je ideální pro uchování hodnoty majetku a ochranu před inflací, méně pro agresivní cash-flow.",
    ],
    taxes: [
      {
        name: "Daň z nabytí nemovitosti",
        value: "0 % (Zrušena v roce 2020).",
      },
      {
        name: "DPH u novostaveb",
        value:
          "12 % (do 120 m² u bytů a 350 m² u domů), jinak 21 %.",
      },
      {
        name: "Daň z příjmu (z pronájmu)",
        value:
          "15 % (nebo 23 % pro vysokopříjmové). Lze uplatnit paušální výdaje 30 % nebo skutečné náklady (odpisy, úroky).",
      },
      {
        name: "Daň z nemovitosti (roční)",
        value:
          "Nízká. Zpravidla stovky až nižší tisíce Kč ročně podle lokality a rozlohy.",
      },
      {
        name: "Daň z prodeje (Kapitálový zisk)",
        value:
          "0 %, pokud nemovitost vlastníte déle než 10 let (nebo 5 let, pokud byla pořízena před r. 2021), nebo v ní 2 roky bydlíte.",
      },
      {
        name: "Další poplatky",
        value:
          "Katastr (2 000 Kč), notář/advokát za úschovu a smlouvy (cca 10 000 – 20 000 Kč).",
      },
    ],
  },
  "SAE (Dubaj)": {
    overview: [
      "Extrémně dynamický trh s daňovým rájem. Vysoký podíl zahraničních investorů a expatů.",
      "Vynikající ROI u krátkodobého i dlouhodobého pronájmu (často 6–9 % čistého p.a.).",
      "Obrovský trh s Off-plan projekty (nemovitosti ve výstavbě) s bezúročnými splátkovými kalendáři přímo od developerů.",
      "Měna (AED) je pevně vázána na americký dolar (USD), což přináší stabilitu, ale i měnové riziko vůči CZK/EUR.",
    ],
    taxes: [
      {
        name: "DLD Poplatek (Daň z převodu)",
        value:
          "4 % z kupní ceny + administrační poplatek (cca 4 000 AED). Platí se při registraci na Dubai Land Department.",
      },
      {
        name: "Daň z příjmu z pronájmu",
        value: "0 % (Absolutní svoboda od daně z příjmu fyzických osob).",
      },
      {
        name: "Daň z nemovitosti (roční)",
        value:
          "0 %. Platí se pouze tzv. Service Charges (poplatky za údržbu budovy, bazénu, fitka), které mohou být vysoké.",
      },
      {
        name: "Daň z prodeje (Kapitálový zisk)",
        value: "0 %.",
      },
      {
        name: "Poplatek za registraci off-plan",
        value:
          "Oqood registrace (4 % z ceny). Provize makléřům u off-plan platí většinou developer.",
      },
    ],
  },
  Španělsko: {
    overview: [
      "Jeden z nejžádanějších trhů pro kombinaci vlastní dovolené a pronájmu v EU.",
      "Ceny jsou velmi závislé na regionu (Andalusie, Costa Blanca, Costa del Sol).",
      "Průměrný výnos 4–6 % z dlouhodobého a 7–10 % z krátkodobého nájmu.",
      "Silná ochrana nájemníků (problém tzv. Okupas), proto je klíčový výběr lokality a pojištění.",
    ],
    taxes: [
      {
        name: "ITP (Daň z převodu u starších nem.)",
        value:
          "Zpravidla 8–10 % podle autonomní oblasti (např. Andalusie 7 %, Valencie 10 %).",
      },
      {
        name: "IVA (DPH u novostaveb)",
        value: "10 % + AJD (kolkovné 1–1,5 %).",
      },
      {
        name: "Daň z příjmu z pronájmu",
        value:
          "19 % pro rezidenty EU (lze odečíst náklady na správu, úroky, odpisy).",
      },
      {
        name: "IBI (Roční daň z nemovitosti)",
        value: "0,4 % až 1,1 % z katastrální (tabulkové) hodnoty.",
      },
      {
        name: "Ostatní transakční náklady",
        value:
          "Notář, právník a zápis do registru přidají k ceně zhruba další 2–3 %.",
      },
    ],
  },
  "Bali (Indonésie)": {
    overview: [
      "Trh zaměřený na maximalizaci ROI díky extrémně silnému celoročnímu turismu.",
      "Koupě probíhá většinou formou Leaseholdu (dlouhodobý pronájem na 25–30 let s opcí).",
      "Hrubé výnosy (ROI) často přesahují 12–18 % p.a. v populárních oblastech jako Canggu nebo Uluwatu.",
      "Vyžaduje zkušenou lokální správcovskou firmu (management fee se pohybuje kolem 15–20 % z obratu).",
    ],
    taxes: [
      {
        name: "BPHTB (Daň z nabytí)",
        value: "5 % z kupní/transakční ceny.",
      },
      {
        name: "PPN (DPH)",
        value:
          "11 % (Uplatňuje se hlavně při nákupu novostavby od developera).",
      },
      {
        name: "PPh (Daň z příjmu)",
        value:
          "10 % z pronájmu (často strháváno formou srážkové daně) u rezidentů/KITAS, pro nerezidenty až 20 %.",
      },
      {
        name: "Notářské poplatky (PPAT)",
        value: "Cca 1 % z hodnoty transakce.",
      },
      {
        name: "Založení PT PMA (Firmy)",
        value:
          "Pokud kupujete Freehold jako cizinec (přes firmu), počítejte s náklady na založení cca 1 000 – 2 500 USD.",
      },
    ],
  },
  Chorvatsko: {
    overview: [
      "Adriatický trh s růstem poptávky po krátkodobém pronájmu a druhém bydlení z EU.",
      "Vstup do Schengenu a eurozóny zvýšil likviditu a zájem mezinárodních kupujících.",
      "Sezónní výnosy u apartmánů u moře bývají 5–8 % hrubého, mimo sezónu klesá obsazenost.",
      "Ideální pro kombinaci vlastní rekreace a pronájmu; klíčová je dostupnost autem z ČR/SK.",
    ],
    taxes: [
      {
        name: "Daň z převodu (starší nemovitosti)",
        value: "3 % z tržní/odhadní hodnoty (platí kupující).",
      },
      {
        name: "DPH u novostaveb od developera",
        value: "25 % (standardní chorvatská DPH u nových jednotek).",
      },
      {
        name: "Daň z příjmu z krátkodobého pronájmu",
        value:
          "Často paušální režim pro soukromé pronajímatele; paušál závisí na kategorii a kapacitě lůžek.",
      },
      {
        name: "Roční daň z nemovitých věcí",
        value:
          "Lokální poplatky (například komunální / turistické poplatky) — výše se liší podle obce.",
      },
      {
        name: "Notář a právní služby",
        value:
          "Typicky 1–2 % transakce včetně ověření a zápisu do pozemkové knihy.",
      },
    ],
  },
  Itálie: {
    overview: [
      "Trh dvou rychlostí: sever a turistické hotspots vs. levnější jih a menší města.",
      "Silná poptávka po druhém bydlení (Toskánsko, Lago di Garda, Ligurie) a po krátkodobém pronájmu ve městech umění.",
      "Dlouhodobé výnosy často 3–5 %; u dobře spravovaných Airbnb lokalit vyšší, ale s regulací.",
      "Freehold je standard; nákup vyžaduje codice fiscale a lokálního notáře (notaio).",
    ],
    taxes: [
      {
        name: "Imposta di registro / IVA",
        value:
          "U „prima casa“ často snížené sazby; u druhé nemovitosti registrační daň typicky kolem 9 % u starších (nebo IVA 10/22 % u novostaveb dle typu).",
      },
      {
        name: "IMU (roční daň z nemovitosti)",
        value:
          "Platí se u druhé nemovitosti; sazba dle obce, často 0,76–1,06 % z katastrální hodnoty.",
      },
      {
        name: "Daň z příjmu z pronájmu",
        value:
          "Možnost cedolare secca (paušál, často 21 % / 10 % u některých smluv) nebo progresivní IRPEF.",
      },
      {
        name: "Notářské poplatky",
        value:
          "Notaio typicky 1–2,5 % z ceny + katastrální a hypotéční daně v řádu nižších procent / pevných položek.",
      },
      {
        name: "Kapitálový zisk při prodeji",
        value:
          "Záleží na době držení a účelu; krátkodobé spekulativní prodeje bývají zdaněny, po delší držbě mohou být osvobozeny.",
      },
    ],
  },
  Slovensko: {
    overview: [
      "Blízký eurový trh bez jazykové bariéry a s právním systémem podobným ČR.",
      "Bratislava a Košice tahají likviditu; výnosy z dlouhodobého nájmu typicky 4–6 %.",
      "Hypotéky pro rezidenty dobře dostupné; nerezidenti řeší limity LTV case-by-case.",
      "Vhodné jako „první zahraniční“ eurová nemovitost bez exotického rizika.",
    ],
    taxes: [
      {
        name: "Daň z nabytí / převodu",
        value:
          "Samostatná daň z převodu byla zrušena; klíčové jsou poplatky za vklad do katastru a služby.",
      },
      {
        name: "DPH u novostaveb",
        value: "20 % u developerů (standardní slovenská DPH u bytových jednotek).",
      },
      {
        name: "Daň z příjmu z pronájmu",
        value:
          "19 % / 25 % dle pásma; lze uplatnit skutečné výdaje nebo paušál dle daňových pravidel SR.",
      },
      {
        name: "Daň z nemovitosti (roční)",
        value:
          "Lokální daň dle obce — obvykle stovky až nižší tisíce EUR ročně.",
      },
      {
        name: "Katastr a právní služby",
        value:
          "Poplatek za vklad + advokát/notář — typicky do jednotek tisíc EUR u běžné transakce.",
      },
    ],
  },
  "Saúdská Arábie": {
    overview: [
      "Trh ve fázi otevírání díky Vision 2030 — projekty giga-rozvoje a rostoucí turismus.",
      "Pro cizince je vlastnictví stále regulované a často vázané na schválené zóny / strukturu.",
      "Potenciál kapitálového zhodnocení u off-plan a nových distriktů, ale vyšší legislativní riziko.",
      "Měna (SAR) je vázaná na USD; cash-flow model vyžaduje lokálního právního a daňového partnera.",
    ],
    taxes: [
      {
        name: "Real Estate Transaction Tax (RETT)",
        value:
          "5 % z hodnoty transakce (typicky na straně prodávajícího, ale vždy ověřte smluvní stranu).",
      },
      {
        name: "VAT (DPH)",
        value:
          "15 % se může uplatnit u některých komerčních / developerských situací — ověřte typ aktiva.",
      },
      {
        name: "Daň z příjmu z pronájmu",
        value:
          "Pro nerezidenty často přes srážkovou daň / firemní strukturu; vyžaduje lokální tax advice.",
      },
      {
        name: "Roční poplatky a správa",
        value:
          "Service charges a poplatky HOA/community v nových masterplan projektech mohou být významné.",
      },
      {
        name: "Právní a registrační náklady",
        value:
          "Registrace, notář a compliance (včetně KYC) — rozpočtujte jednotky procent / fixní balíčky u counsel.",
      },
    ],
  },
};

export function getCountryInfoData(
  countryName: string
): CountryInfoEntry | null {
  return COUNTRY_INFO_DATA[countryName] ?? null;
}
