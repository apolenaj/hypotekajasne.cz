import { Scale } from "lucide-react";

export type LegalPageType = "gdpr" | "smlouvy" | "zasady";

const LEGAL_META: Record<
  LegalPageType,
  { title: string; subtitle: string }
> = {
  gdpr: {
    title: "Ochrana osobních údajů (GDPR)",
    subtitle: "Zásady zpracování osobních údajů uživatelů platformy.",
  },
  smlouvy: {
    title: "Smlouvy a podmínky užití",
    subtitle: "Rámec používání webu HypotékaJasně.cz.",
  },
  zasady: {
    title: "Zásady používání platformy",
    subtitle: "Pravidla, cookies a zásady prezentace obsahu.",
  },
};

const DISCLAIMER =
  "Právní doložka: Provozovatel tohoto webu nevykonává činnost podle zákona č. 257/2016 Sb., o spotřebitelském úvěru, ani neposkytuje investiční poradenství. Platforma slouží ke sběru a generování poptávek (leadů), které jsou se souhlasem uživatele předávány třetím stranám – oprávněným subjektům disponujícím příslušnými licencemi.";

function GdprContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <div className="prose max-w-none">
        <p className="mb-6">
          Ochrana vašeho soukromí je pro nás prioritou. Tyto zásady vysvětlují,
          jaké osobní údaje shromažďujeme, proč tak činíme a jaká máte práva v
          souvislosti s využíváním platformy{" "}
          <strong>Hypotéka Jasně</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          1. Kdo je správcem vašich údajů?
        </h3>
        <p>
          Správcem vašich osobních údajů je provozovatel platformy Hypotéka
          Jasně, se sídlem{" "}
          <strong>Soukenická 6, Krnov, 79401 Česká republika</strong>. V případě
          jakýchkoliv dotazů ohledně GDPR nás můžete kontaktovat na e-mailu:{" "}
          <strong>info@hypotekajasne.cz</strong> nebo telefonu{" "}
          <strong>+420 727 814 810</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          2. Jaké údaje zpracováváme?
        </h3>
        <p>
          Abychom vám mohli poskytnout naše služby (analýzy, kalkulace a
          propojení s experty), zpracováváme následující údaje:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Základní kontaktní údaje:</strong> Jméno, příjmení, e-mailová
            adresa, telefonní číslo.
          </li>
          <li>
            <strong>
              Informace o vašich preferencích (Investiční/Hypoteční pas):
            </strong>{" "}
            Vámi zadané údaje o výši vlastního kapitálu, měsíčních příjmech a
            výdajích, účelu investice a preferovaných lokalitách.
          </li>
          <li>
            <strong>Technické údaje:</strong> IP adresa, typ prohlížeče a data o
            pohybu na našich webových stránkách (prostřednictvím cookies) za
            účelem vylepšování platformy.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          3. Proč údaje zpracováváme a na jakém právním základě?
        </h3>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Předání poptávky (Lead) partnerům:</strong> Vaše údaje
            zpracováváme a předáváme licencovaným hypotečním či realitním
            specialistům{" "}
            <em>výhradně na základě vašeho výslovného souhlasu</em> (čl. 6 odst.
            1 písm. a) GDPR), který nám udělujete odesláním kontaktního
            formuláře či žádosti o analýzu.
          </li>
          <li>
            <strong>Vylepšování našich služeb:</strong> Na základě našeho
            oprávněného zájmu (čl. 6 odst. 1 písm. f) GDPR) analyzujeme
            návštěvnost webu, abychom pro vás platformu neustále zlepšovali.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          4. Komu vaše údaje předáváme?
        </h3>
        <p>
          Nejsme finanční poradci. Náš obchodní model spočívá v propojení
          uživatelů s experty. Vaše osobní a finanční údaje předáme (s vaším
          souhlasem) našim <strong>prověřeným partnerům</strong>{" "}
          (licencovaným hypotečním zprostředkovatelům, bankám, realitním
          makléřům či developerům v ČR i zahraničí), aby vás mohli s nabídkou
          napřímo kontaktovat. Zajišťujeme, že naši partneři dodržují stejné
          standardy ochrany dat jako my.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          5. Jak dlouho vaše údaje uchováváme?
        </h3>
        <p>
          Vaše údaje uchováváme pouze po dobu nezbytně nutnou k naplnění účelu,
          pro který byly shromážděny. U poptávek předávaných partnerům
          uchováváme údaje standardně po dobu <strong>3 let</strong>, případně
          do doby, než svůj souhlas odvoláte.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          6. Jaká máte práva?
        </h3>
        <p>Podle nařízení GDPR máte mimo jiné právo:</p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Požadovat přístup</strong> ke svým osobním údajům a
            informace o jejich zpracování.
          </li>
          <li>
            <strong>Požadovat opravu nebo výmaz</strong> vašich osobních údajů
            („právo být zapomenut”).
          </li>
          <li>
            <strong>Kdykoliv odvolat svůj souhlas</strong> se zpracováním údajů
            pro marketingové účely a předávání partnerům (odvolání zašlete na
            info@hypotekajasne.cz).
          </li>
          <li>
            <strong>Podat stížnost</strong> u Úřadu pro ochranu osobních údajů
            (ÚOOÚ), pokud se domníváte, že s vašimi daty nenakládáme v souladu s
            právními předpisy.
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-8 text-sm text-gray-500 italic">
        Poslední aktualizace: červenec 2026. Tento dokument má informativní
        charakter. Doporučujeme jeho finální znění zkonzultovat s právním
        zástupcem.
      </div>
    </div>
  );
}

function SmlouvyContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <div className="prose max-w-none">
        <p className="mb-6">
          Tyto podmínky upravují pravidla pro užívání webového portálu a
          technologické platformy <strong>Hypotéka Jasně</strong> (dále jen
          „Portál“). Používáním tohoto Portálu potvrzujete, že jste se s těmito
          podmínkami seznámili, rozumíte jim a souhlasíte s nimi.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          1. Povaha služeb a informační charakter
        </h3>
        <p>
          Portál Hypotéka Jasně je{" "}
          <strong>
            nezávislou technologickou, vzdělávací a informační platformou
          </strong>
          . Provozovatel Portálu se sídlem Soukenická 6, Krnov, 79401,
          nevykonává činnost banky, neposkytuje spotřebitelské úvěry ani
          nevykonává činnost licencovaného finančního zprostředkovatele podle
          zákona č. 257/2016 Sb., o spotřebitelském úvěru, ani neposkytuje
          regulované investiční či daňové poradenství.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          2. Kalkulačky a orientační výpočty
        </h3>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Nezávaznost dat:</strong> Všechny výpočty generované nástroji
            na Portálu (jako jsou Investiční rentgen, Hypoteční pas, Sněhová
            koule a další kalkulačky) vycházejí z modelových předpokladů,
            průměrných tržních hodnot a algoritmů Portálu.
          </li>
          <li>
            <strong>Žádná garance:</strong> Tyto výpočty slouží{" "}
            <strong>výhradně pro vaši základní orientaci a představu</strong>.
            Nepředstavují závaznou nabídku financování, garanci úrokové sazby,
            ani příslib budoucích výnosů z pronájmu či růstu ceny nemovitosti.
          </li>
          <li>
            Skutečné podmínky úvěru nebo finální výnos investice se mohou od
            našich modelů výrazně lišit v závislosti na tržní situaci, vaší
            bonitě a konkrétní bance.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          3. Propojení s experty (Předávání poptávek)
        </h3>
        <p>
          Hlavním účelem Portálu je poskytnout vám informace a následně vás – na
          základě vaší výslovné žádosti odeslané přes naše formuláře – propojit
          s profesionály.
        </p>
        <p className="mt-2">
          Odesláním poptávky žádáte o to, aby vaše data (tzv. Lead) byla předána{" "}
          <strong>třetím stranám – prověřeným licencovaným partnerům</strong>{" "}
          (hypotečním specialistům, realitním makléřům, developerům). Samotný
          proces vyjednávání a případné uzavření smluv (o úvěru, o koupi)
          probíhá výhradně mezi vámi a těmito partnery mimo náš Portál.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          4. Vyloučení odpovědnosti
        </h3>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            Provozovatel Portálu{" "}
            <strong>nenese žádnou právní ani finanční odpovědnost</strong> za
            škody, ušlý zisk nebo jiné komplikace, které uživateli vzniknou na
            základě rozhodnutí učiněných s využitím informací či kalkulaček na
            tomto webu.
          </li>
          <li>
            Provozovatel nenese odpovědnost za obsah, pravdivost a aktuálnost
            informací, které obdržíte od partnerů (třetích stran), na které jsme
            vás napojili. Každou investiční nebo úvěrovou smlouvu vždy pečlivě
            prostudujte s vaším právním zástupcem.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          5. Autorská práva a ochrana dat
        </h3>
        <p>
          Veškerý obsah Portálu (zejména texty Hypoteční akademie, analytické
          texty zemí, grafika, algoritmy kalkulaček a celkový design) je chráněn
          autorským právem. Je zakázáno obsah Portálu kopírovat, vytěžovat (např.
          web scraping) nebo jej využívat ke komerčním účelům bez písemného
          souhlasu provozovatele.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-8 text-sm text-gray-500 italic">
        Platnost od: července 2026. Provozovatel si vyhrazuje právo tyto
        podmínky kdykoliv změnit. Doporučujeme jejich znění průběžně sledovat.
      </div>
    </div>
  );
}

function ZasadyContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <div className="prose max-w-none">
        <p className="mb-6">
          Tyto Zásady používání platformy doplňují naše Smlouvy a podmínky užití.
          Upravují technické fungování webu, využívání souborů cookies a
          pravidla transparentní prezentace obsahu na portálu{" "}
          <strong>Hypotéka Jasně</strong>.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          1. Jak využíváme soubory Cookies
        </h3>
        <p>
          Pro správné fungování našich kalkulaček a analýzu návštěvnosti
          využíváme malé textové soubory známé jako cookies. Dělíme je do
          následujících kategorií:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Technické a nezbytné cookies:</strong> Jsou nutné pro
            základní fungování webu (např. pamatují si hodnoty zadané do
            kalkulačky při přechodu na další krok). Nelze je vypnout.
          </li>
          <li>
            <strong>Analytické cookies:</strong> Pomáhají nám pochopit, jak
            návštěvníci náš web používají (např. Google Analytics). Díky nim
            můžeme vylepšovat uživatelské rozhraní. Zpracováváme je pouze s
            vaším souhlasem.
          </li>
          <li>
            <strong>Marketingové cookies:</strong> Slouží k zobrazení relevantní
            reklamy na jiných webech. Tyto cookies využíváme výhradně tehdy,
            pokud nám k tomu dáte aktivní souhlas přes cookie lištu.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          2. Zásady prezentace obsahu a hodnocení (Transparentnost)
        </h3>
        <p>
          Zakládáme si na tom, abyste přesně věděli, jak náš byznys model funguje
          a jak zobrazujeme informace:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Nezávislost Investičního skóre:</strong> Výpočty v našem
            Investičním rentgenu a případné hodnotící skóre nemovitostí jsou
            generovány čistě matematickým algoritmem.{" "}
            <strong>
              Naši partneři si nemohou zaplatit lepší skóre
            </strong>{" "}
            pro své projekty.
          </li>
          <li>
            <strong>Provizní model:</strong> Přístup na portál je pro běžné
            uživatele zcela zdarma. Platforma je financována prostřednictvím
            marketingových B2B spoluprací. Pokud vás na základě vaší žádosti
            propojíme s expertem (vygenerujeme tzv. Lead), můžeme za toto
            zprostředkování obdržet od partnera marketingovou odměnu nebo
            provizi.
          </li>
          <li>
            <strong>Aktualizace dat:</strong> Snažíme se data na „Kartách zemí”
            (daně, právní procesy) udržovat maximálně aktuální, vždy je však
            uváděno datum poslední kontroly. Upozorňujeme, že legislativa v
            zahraničí se může dynamicky měnit.
          </li>
        </ul>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
          3. Pravidla chování uživatelů
        </h3>
        <p>
          Abychom zajistili plynulý chod portálu pro všechny, platí pro používání
          webu následující pravidla:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Zákaz automatizovaného vytěžování dat:</strong> Je přísně
            zakázáno používat softwarové roboty, crawlery či skripty (scraping)
            za účelem hromadného stahování dat z našich kalkulaček, databází a
            akademie.
          </li>
          <li>
            <strong>Pravdivost kontaktních údajů:</strong> Při odesílání
            kontaktních formulářů za účelem propojení s expertem se zavazujete
            používat pouze své vlastní a pravdivé kontaktní údaje. Vytváření
            falešných poptávek (spam) je zakázáno.
          </li>
          <li>
            V případě porušení těchto pravidel si provozovatel vyhrazuje právo
            omezit nebo trvale zablokovat IP adrese uživatele přístup k
            platformě.
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-8 text-sm text-gray-500 italic">
        Platnost od: července 2026. Své preference ohledně ukládání souborů
        cookies můžete kdykoliv změnit v nastavení vašeho prohlížeče nebo
        kliknutím na odkaz „Nastavení cookies” v patičce webu.
      </div>
    </div>
  );
}

export function LegalView({ type }: { type: LegalPageType }) {
  const meta = LEGAL_META[type];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <div className="flex items-center gap-3 text-emerald-200">
            <Scale className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Právní informace
            </span>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-black md:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 text-emerald-50/90">{meta.subtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 sm:text-base">
          <p className="font-bold">Právní doložka</p>
          <p className="mt-2">{DISCLAIMER}</p>
        </div>

        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-10">
          {type === "gdpr" ? (
            <GdprContent />
          ) : type === "smlouvy" ? (
            <SmlouvyContent />
          ) : (
            <ZasadyContent />
          )}
        </article>
      </div>
    </div>
  );
}
