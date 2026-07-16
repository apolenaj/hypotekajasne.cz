export interface BuyingProcessStep {
  step: number;
  title: string;
  description: string;
  details: string[];
  warning: string;
}

/** @deprecated Use BuyingProcessStep */
export type BuyingProcessCzStep = BuyingProcessStep;

export const buyingProcessCzData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Finanční příprava a prescoring",
    description:
      "Než začnete hledat, musíte znát svůj reálný rozpočet. Zjistěte si, na jakou hypotéku dosáhnete (tzv. prescoring u banky).",
    details: [
      "Předschválení hypotéky vám dá obrovskou výhodu při vyjednávání s prodávajícím.",
      "Počítejte s vlastními zdroji (typicky 10–20 % LTV) a rezervou 5-10 % na daň, poplatky a drobné opravy.",
    ],
    warning:
      "Nikdy nepodepisujte rezervační smlouvu, dokud nemáte jistotu, že vám banka peníze opravdu půjčí.",
  },
  {
    step: 2,
    title: "Prohlídka a technicko-právní prověrka",
    description:
      "Našli jste ideální nemovitost. Nyní přichází fáze due diligence (hloubkové prověrky).",
    details: [
      "Právní stav: Kontrola listu vlastnictví (LV) na katastru – exekuce, zástavní práva, věcná břemena.",
      "Technický stav: Přizvěte inspektora nemovitostí (kontrola vlhkosti, statiky, rozvodů, plísní).",
      "U bytů: Zkontrolujte hospodaření SVJ, výši fondu oprav a případné dluhy domu vůči dodavatelům.",
    ],
    warning:
      "Realitní makléř zastupuje primárně prodávajícího. Nespoléhejte jen na jeho slova, vše si ověřte.",
  },
  {
    step: 3,
    title: "Rezervační smlouva",
    description:
      "Dokument, který stahuje nemovitost z trhu. Obvykle se skládá rezervační poplatek (cca 3–5 % z kupní ceny).",
    details: [
      "Smlouva by měla být vždy trojstranná (Vy, Prodávající, Realitní kancelář).",
      "Zkontrolujte, že se rezervační poplatek započítává do celkové kupní ceny.",
    ],
    warning:
      "Trvejte na doložce, že pokud vám banka neschválí úvěr z důvodu na straně nemovitosti (např. nízký odhad), rezervační poplatek se vám vrací v plné výši.",
  },
  {
    step: 4,
    title: "Financování a odhad nemovitosti",
    description:
      "Proces schvalování samotné hypotéky na konkrétní vybranou nemovitost.",
    details: [
      "Banka k nemovitosti vyšle vlastního odhadce. Pokud vyjde odhad níže než kupní cena, rozdíl doplácíte ze svého.",
      "Podpis úvěrové smlouvy a zástavních smluv (ty se musí vložit na katastr ještě před čerpáním úvěru).",
    ],
    warning:
      "Nezapomeňte včas uzavřít pojištění nemovitosti s vinkulací ve prospěch banky, bez toho banka neuvolní peníze.",
  },
  {
    step: 5,
    title: "Kupní smlouva a advokátní úschova",
    description:
      "Nejdůležitější právní krok. Peníze nikdy neposílejte přímo na účet prodávajícího!",
    details: [
      "Kupní smlouvu a smlouvu o úschově by měl ideálně zkontrolovat váš vlastní advokát.",
      "Peníze (vaše hotovost i úvěr z banky) se posílají výhradně do chráněné úschovy (advokátní, notářské nebo bankovní).",
    ],
    warning:
      "Úschova na běžném účtu realitní kanceláře je extrémně riziková. Vždy vyžadujte nezávislou úschovu s přesnými podmínkami uvolnění peněz.",
  },
  {
    step: 6,
    title: "Katastr a předání nemovitosti",
    description: "Zápis do katastru a fyzické převzetí klíčů.",
    details: [
      "Katastr vyznačí plombu (začíná 20denní ochranná lhůta, kdy se pouze čeká).",
      "Po zápisu vlastnictví schovatel uvolní peníze prodávajícímu.",
      "Podepisuje se Předávací protokol (stavy měřidel) a přepisují se energie.",
    ],
    warning:
      "Až budete majitelem, nezapomeňte se do konce ledna následujícího roku přihlásit k platbě Daně z nemovitých věcí!",
  },
];
