import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessCroatiaData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Získání OIB (Daňové identifikační číslo)",
    description:
      "OIB je chorvatský ekvivalent našeho RČ/IČO, nutný pro jakýkoliv právní úkon.",
    details: [
      "Vyřídíte na místním finančním úřadě (Porezna uprava).",
      "Nutné pro zápis v katastru a připojení energií.",
    ],
    warning:
      "Bez OIB nemůžete vlastnit nemovitost. Vyřízení je administrativně jednoduché, ale je to první krok.",
  },
  {
    step: 2,
    title: "Prověrka v Zemljišne knjige",
    description: "Katastr nemovitostí (Zemljišne knjige) je v Chorvatsku klíčový.",
    details: [
      "Prověřte výpis (Vlasnički list) – zda souhlasí majitel a zda není nemovitost zatížena spory.",
      "Pozor na nemovitosti, kde jsou zapsáni dědici, kteří s prodejem nesouhlasí.",
    ],
    warning:
      "V Chorvatsku je historicky mnoho nemovitostí s nejasným vlastnictvím po rozpadu Jugoslávie. Prověrka katastru musí být 100%.",
  },
  {
    step: 3,
    title: "Predugovor (Smlouva o smlouvě budoucí)",
    description: "Podpis předběžné smlouvy a složení zálohy (kapara).",
    details: [
      "Definuje cenu, termín a technický stav.",
      "V Chorvatsku je běžné skládat zálohu přímo prodávajícímu, ale bez právníka to nedělejte.",
    ],
    warning:
      "Při předání hotovosti prodávajícímu vždy vyžadujte potvrzení (potvrda) s notářským ověřením!",
  },
  {
    step: 4,
    title: "Solemnizace (Notářské ověření)",
    description: "Chorvatský notář ověřuje podpisy a právní závaznost.",
    details: [
      "Notář zajišťuje, aby kupní smlouva odpovídala zákonům.",
      "Provádí zápis na katastr.",
    ],
    warning:
      "Notář v Chorvatsku ne vždy garantuje technický stav. Trvejte na doložce, že nemovitost odpovídá popisu.",
  },
  {
    step: 5,
    title: "Platba daně a zápis",
    description: "Po podpisu smlouvy probíhá platba daně z nabytí (3 %).",
    details: [
      "Daň se platí po obdržení rozhodnutí finančního úřadu.",
      "Zápis do katastru (uknjižba vlasništva) je finální krok.",
    ],
    warning:
      "Daň z nabytí je v Chorvatsku 3 %. Nezapomeňte ji přiznat finančnímu úřadu, stát si ji vyžádá sám, ale včasná platba je základ.",
  },
  {
    step: 6,
    title: "Předání a energie",
    description: "Předávací protokol a přepis.",
    details: [
      "Fyzické předání klíčů a opis měřidel.",
      "Přepis elektřiny (HEP) a vody.",
    ],
    warning:
      "V Chorvatsku se energie často účtují zálohově. Ujistěte se, že prodávající uhradil všechny faktury do dne předání.",
  },
];
