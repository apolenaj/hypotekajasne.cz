import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessSlovakiaData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Zajištění hypotéky",
    description: "Slovenské banky standardně financují 80 % hodnoty (LTV).",
    details: [
      "Při koupi investičního bytu se banky dívají na bonitu i nájemní potenciál.",
      "Možnost využít eurové hypotéky.",
    ],
    warning: "Pozor na limity NBS (Národná banka Slovenska) pro zadluženost domácností.",
  },
  {
    step: 2,
    title: "Rezervační smlouva",
    description: "Dohoda s makléřem/prodávajícím o rezervaci bytu.",
    details: [
      "Podepisuje se po prohlídce a kontrole LV (listu vlastníctva).",
      "Rezervační poplatek se započítá do ceny.",
    ],
    warning: "Prověřte, zda na bytě nejsou exekuce nebo plombu na katastru.",
  },
  {
    step: 3,
    title: "Kúpna zmluva",
    description: "Návrh smlouvy, který musí být právně perfektní.",
    details: [
      "Doporučujeme advokátní autorizaci podpisu (zrychluje vklad).",
      "Všechny podpisy musí být úředně ověřeny.",
    ],
    warning: "Peníze posílejte výhradně do vinkulované úschovy nebo notářské úschovy.",
  },
  {
    step: 4,
    title: "Návrh na vklad do katastra",
    description: "Podání na Okresný úřad, katastrálny odbor.",
    details: [
      "Poplatek za vklad (cca 66 EUR standardně, 266 EUR zrychlený).",
      "Vkladové řízení trvá standardně 30 dní.",
    ],
    warning:
      "Katastr nemovitostí na Slovensku je velmi přísný. I drobná chyba ve smlouvě znamená zamítnutí vkladu.",
  },
  {
    step: 5,
    title: "Výplata prostředků",
    description: "Uvolnění peněz z úschovy po zápisu vkladu.",
    details: [
      "Advokát/notář uvolní peníze prodávajícímu až po předložení listu vlastnictví s vaším jménem.",
    ],
    warning: "Nikdy neplaťte celou částku před zápisem vlastnictví na katastr.",
  },
  {
    step: 6,
    title: "Preberací protokol a energie",
    description: "Fyzické předání nemovitosti.",
    details: [
      "Zápis stavů energií, předání klíčů.",
      "Přepis u dodavatelů (SPP, elektrárne, správce).",
    ],
    warning:
      "Nezapomeňte podat daňové přiznání k dani z nehnuteľnosti na obecním úřadě do 31. ledna!",
  },
];
