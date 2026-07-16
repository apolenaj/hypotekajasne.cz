import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessSpainData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "NIE číslo a Bankovní účet",
    description:
      "Získání identifikačního čísla cizince (NIE) je nezbytné pro jakýkoliv úkon ve Španělsku.",
    details: [
      "NIE vyřídíte na konzulátu v ČR nebo na cizinecké policii ve Španělsku.",
      "Otevření španělského účtu usnadní platby daní a energií.",
    ],
    warning: "Bez NIE se nepohnete. Vyřízení trvá týdny, začněte ihned.",
  },
  {
    step: 2,
    title: "Rezervace a Due Diligence",
    description: "Prověření nemovitosti (Nota Simple).",
    details: [
      "Nota Simple ukáže, zda nemovitost nemá dluhy, exekuce nebo věcná břemena.",
      "Prověřte, zda má dům platný energetický štítek.",
    ],
    warning:
      "Často se prodávají domy s černými přístavbami. Nechte si prověřit, zda je stavba legální v katastru (Registro de la Propiedad).",
  },
  {
    step: 3,
    title: "Smlouva o budoucí smlouvě (Contrato de Arras)",
    description: "Rezervační smlouva, kde skládáte zálohu (obvykle 10 %).",
    details: [
      "Pokud vy couvnete, propadá záloha. Pokud couvne prodávající, musí vám vrátit dvojnásobek.",
    ],
    warning:
      "Vždy nechte smlouvu prověřit právníkem. Vracení dvojnásobku je sice zákonné, ale v praxi ho musíte vymáhat soudně, což trvá roky.",
  },
  {
    step: 4,
    title: "Notář a Escritura",
    description: "Kupní smlouva se podepisuje před notářem (Escritura Pública).",
    details: [
      "Notář ve Španělsku je veřejný činitel, který garantuje právní čistotu převodu.",
      "Doplácí se zbytek kupní ceny (obvykle šekem).",
    ],
    warning: "Notář neprovádí fyzickou inspekci. To je vaše odpovědnost.",
  },
  {
    step: 5,
    title: "Daně (ITP nebo IVA)",
    description: "Platba daně z nabytí.",
    details: [
      "ITP (daň z převodu) u starších nemovitostí (6–10 % dle regionu).",
      "IVA (DPH) u novostaveb (10 %).",
    ],
    warning:
      "Daň musíte zaplatit v krátké lhůtě (cca 30 dní). Pokud zapomenete, hrozí vysoké penále.",
  },
  {
    step: 6,
    title: "Zápis do katastru a energie",
    description: "Finální registrace na Registro de la Propiedad.",
    details: [
      "Zápis trvá i 3 měsíce.",
      "Přepis vody, elektřiny a plynu (nutný španělský účet).",
    ],
    warning:
      "Prověřte, zda prodávající nemá dluhy na energiích – ty totiž zůstávají u nemovitosti a přecházejí na vás!",
  },
];
