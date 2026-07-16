export type ArticleCategory =
  | "Makroekonomika"
  | "Zahraniční trhy"
  | "Hypotéky v ČR"
  | "Investiční tipy";

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  targetCountry?: string;
  readTime: string;
  date: string;
  image: string;
  featured: boolean;
  content: string;
}

export const articleCategories: Array<ArticleCategory | "Vše"> = [
  "Vše",
  "Makroekonomika",
  "Zahraniční trhy",
  "Hypotéky v ČR",
  "Investiční tipy",
];

export const articlesData: Article[] = [
  {
    id: 1,
    title:
      "Jak globální ekonomika ovlivní úrokové sazby hypoték v roce 2026",
    excerpt:
      "Centrální banky mění kurz. Co to znamená pro investory do nemovitostí v ČR a jak se připravit na další fixaci.",
    category: "Makroekonomika",
    readTime: "8 min čtení",
    date: "12. července 2026",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    featured: true,
    content: `
      <p>V posledních měsících jsme svědky masivního přeskupování kapitálu. Poté, co centrální banky (včetně FEDu a ECB) definitivně potvrdily zkrocení inflační spirály, začal trh oceňovat novou éru "normálních" úrokových sazeb. Co to znamená pro Českou národní banku a váš domácí rozpočet?</p>
      
      <h3>Mýtus návratu ke 2 %</h3>
      <p>Mnoho investorů mentálně uvízlo v anomálii let 2015–2020 a stále čekají, až hypotéky klesnou ke 2 %. To je však hrubá chyba. Historický normál zdravé ekonomiky se pohybuje mezi 3,5 až 4,5 %. Jakýkoliv pokles pod tuto hranici by znamenal, že jsme v hluboké recesi a centrální banky musí ekonomiku uměle stimulovat.</p>
      <p>Pokud dnes vidíme nabídky bank začínající strohou pětkou či vysokou čtyřkou, blížíme se k optimu. Otázka pro investora tedy nezní <em>"kdy to klesne"</em>, ale <em>"jak v tomto prostředí maximalizovat výnos z nájmu"</em>.</p>

      <h3>Strategie fixace pro rok 2026: Krátká, nebo dlouhá?</h3>
      <p>Trh je aktuálně rozdělen na dva tábory. My doporučujeme následující přístup:</p>
      <ul>
        <li><strong>Kupujete investiční byt pro cash-flow:</strong> Zvolte 3letou fixaci. Dává vám to flexibilitu pro případný refinanc, pokud by ECB sazby ještě mírně podstřelila, ale zároveň vás chrání před krátkodobými výkyvy.</li>
        <li><strong>Kupujete rodinný dům pro vlastní bydlení:</strong> Tady je králem jistota. 5letá fixace na sazbě kolem 4,2 % vám umožní klidné spaní. Rozdíl mezi 3letou a 5letou sazbou je aktuálně minimální, ale prémie za klid (tzv. peace-of-mind premium) je k nezaplacení.</li>
      </ul>

      <h3>Závěrečný verdikt</h3>
      <p>Nečekejte na dno. Kdo čeká na absolutní dno úrokových sazeb, zpravidla zaplatí mnohem více na kupní ceně nemovitosti. Jakmile totiž sazby klesnou o dalšího půl procentního bodu, do trhu se vrhne odložená poptávka desetitisíců kupců, což vyžene ceny nemovitostí nahoru o dalších 10–15 %.</p>
    `,
  },
  {
    id: 2,
    title:
      "Proč Češi skupují apartmány ve Španělsku: Skrytá rizika a reálné výnosy",
    excerpt:
      "Detailní pohled na oblíbené destinace jako Costa del Sol. Na co si dát pozor při sjednávání španělské hypotéky a proč kalkulačky často lžou.",
    category: "Zahraniční trhy",
    targetCountry: "Španělsko",
    readTime: "12 min čtení",
    date: "8. července 2026",
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    featured: false,
    content: `
      <p>Španělsko se stalo novým Chorvatskem, ale s jedním obrovským rozdílem – celoroční využitelností a sofistikovaným trhem. Jenže nákup nemovitosti v Andalusii nebo na pobřeží Costa Blanca není jako koupě chaty na Slapech. Je to byznysová transakce se všemi svými úskalími.</p>

      <h3>Byrokratické peklo zvané NIE a ITP</h3>
      <p>Zatímco v ČR je nákupní proces poměrně přímočarý, ve Španělsku vás čeká střet s jižanskou byrokracií. Prvním krokem je <strong>získání NIE (Número de Identidad de Extranjero)</strong>. Bez něj nekoupíte ani auto, natož dům. Následuje zřízení lokálního bankovního účtu, což může trvat týdny kvůli přísným pravidlům proti praní špinavých peněz (AML).</p>
      <p>Největším šokem pro české investory jsou však transakční náklady. Ve Španělsku počítejte s tím, že nad rámec kupní ceny zaplatíte zhruba <strong>10 až 13 % navíc</strong> na daních (ITP u starších nemovitostí, IVA u nových), notářských poplatcích a právním zastoupení. Pokud vidíte vilu za 300 000 EUR, musíte mít připraveno minimálně 335 000 EUR.</p>

      <h3>Hrozba jménem 'Okupas'</h3>
      <p>Fenomén 'Okupas' (squatteři) je častým strašákem, kterým se živí český bulvár. Realita? Ano, španělský zákon paradoxně chrání člověka, který se vám nelegálně nastěhuje do bytu, pokud to nezjistíte do 48 hodin. V praxi se to však týká spíše opuštěných bankovních nemovitostí v chudých vnitrozemských regionech. V prémiových resortech s 24/7 security a alarmem napojeným na policii je toto riziko takřka nulové.</p>

      <h3>Reálná čísla: Airbnb vs. Dlouhodobý pronájem</h3>
      <p>Agenti vám budou slibovat 10% výnos z letních pronájmů. Ale pozor: městy jako Málaga nebo Barcelona se šíří tvrdá regulace. Získání turistické licence se stává privilegiem. Pokud plánujete nákup, hledejte urbanizace, které mají turistickou licenci již "vrozenou" ve stanovách komunity.</p>
      <p>Po odečtení poplatků správcovské firmě (často 20 % z obratu), komunitních poplatků a daní se čistý výnos (Net ROI) stabilně pohybuje mezi <strong>4,5 % až 6 % p.a.</strong> To je stále vynikající hodnota, obzvlášť když započítáte růst hodnoty samotné nemovitosti a možnost strávit tam měsíc v roce zadarmo.</p>
    `,
  },
  {
    id: 3,
    title: "Flipping nemovitostí v Dubaji: Kde končí marketing a začíná realita?",
    excerpt:
      "Nákup off-plan projektů může být extrémně ziskový, ale má svá tvrdá pravidla. Analyzovali jsme data z trhu a rozbili sny naivních flipperů.",
    category: "Investiční tipy",
    targetCountry: "SAE (Dubaj)",
    readTime: "10 min čtení",
    date: "5. července 2026",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    featured: false,
    content: `
      <p>Otevřete si Instagram a určitě na vás vyskočí reklama: <em>"Kupte apartmán v Dubaji, zaplaťte jen 20 % a prodejte ho ještě před dostavěním se ziskem 50 %!"</em> Zní to jako tiskárna na peníze. Realita? Tento model funguje, ale pouze pokud víte, s kým hrajete.</p>

      <h3>Zlaté pravidlo Dubaje: Tier 1 Developeři</h3>
      <p>Dubajský trh je obrovský a fragmentovaný. Pokud koupíte nemovitost od "Tier 1" developera jako je <strong>Emaar, Nakheel, nebo Meraas</strong> v prémiové lokalitě, máte obrovskou šanci na úspěšný flip. Tyto projekty se vyprodají za 3 hodiny a okamžitě vzniká sekundární trh lidí, na které se nedostalo. Zde můžete svůj kontrakt prodat s prémií (tzv. premium) už měsíc po podpisu.</p>
      <p>Problém nastává, když vás agresivní makléř přesvědčí ke koupi "Tier 3" developera kdesi v poušti s argumentem, že "se to tam teprve rozroste". U těchto projektů je nabídka často vyšší než poptávka. Při pokusu o předčasný prodej (flip) zjistíte, že developer stále prodává neprodané jednotky ze stejného bloku, a navíc nabízí platební plány, kterým vy jako soukromý prodejce nemůžete konkurovat.</p>

      <h3>Skryté náklady: Service Charges a DLD</h3>
      <p>Daňová svoboda v Dubaji je legendární – neplatíte daň z příjmu, ani daň z nabytí nemovitosti. Co vám ale na první schůzce často neřeknou, jsou tzv. <strong>Service Charges</strong> (poplatky za správu budovy). U luxusních věží v Marina nebo Downtown se tyto poplatky šplhají do astronomických výšin (klidně 25 AED za čtvereční stopu). Pokud neseženete nájemce okamžitě, tyto poplatky vám sežerou likviditu.</p>
      <p>Při nákupu také platíte 4% poplatek Land Departmentu (DLD). Aby se vám flip vyplatil, musí cena nemovitosti stoupnout minimálně o oněch 4 %, plus pokrýt náklady na zprostředkovatele.</p>

      <h3>Rada expertů</h3>
      <p>Dubaj je trh pro odvážné s připravenou hotovostí. Nechoďte do off-plan flippingu, pokud nemáte peníze na pokrytí celé stavby. Pokud projekt nepůjde prodat (např. kvůli globální krizi), musíte být schopni jej doplatit, převzít a následně s vysokým výnosem dlouhodobě pronajímat. To je ten skutečný "Plan B".</p>
    `,
  },
  {
    id: 4,
    title: "Konec levných peněz? Co znamená nová regulace pro drobné investory",
    excerpt:
      "Omezení LTV a nové regulace. Připravili jsme přehled, jak restrukturalizovat vaše portfolio a proč může být založení S.R.O. vaší záchranou.",
    category: "Hypotéky v ČR",
    targetCountry: "Česká republika",
    readTime: "7 min čtení",
    date: "1. července 2026",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    featured: false,
    content: `
      <p>Drobní realitní investoři v České republice čelí novému prostředí. Zlatá éra, kdy si střední třída mohla na rodné číslo vzít 4 investiční byty se 100% hypotékou, je nenávratně pryč. Česká národní banka (ČNB) drží na uzdě limity úvěrových ukazatelů LTV, DTI a DSTI, aby ochránila bankovní sektor.</p>

      <h3>Zeď jménem DSTI</h3>
      <p>I když máte dostatek vlastního kapitálu na zaplacení 20 % akontace (LTV), narazíte na ukazatel DSTI (Debt Service-to-Income). Ten určuje, jaká část vašich měsíčních čistých příjmů může padnout na splátky všech úvěrů. Jakmile se blížíte k 45–50 %, banka vám jednoduše další hypotéku neschválí, bez ohledu na to, jak ziskový se váš nový byt zdá být na papíře.</p>

      <h3>Cesta ven č. 1: Transformace na SPV (S.R.O.)</h3>
      <p>Profesionální investoři to řeší převodem svého portfolia do tzv. SPV (Special Purpose Vehicle) – firemní struktury, typicky s.r.o. Komerční financování firem se totiž neřídí limity pro fyzické osoby nastavené ČNB. Banka při poskytování firemního úvěru neposuzuje vaši osobní mzdu, ale <strong>tzv. DSCR (Debt Service Coverage Ratio)</strong> – tedy schopnost samotného projektu (bytu) vygenerovat z nájmu dostatek peněz na zaplacení splátky.</p>
      <p>Založení a správa s.r.o. nese dodatečné účetní náklady, ale otevírá cestu k neomezenému škálování portfolia.</p>

      <h3>Cesta ven č. 2: Zahraniční expanze</h3>
      <p>Druhou možností je alokace kapitálu do zahraničí. Pokud nakupujete nemovitost například ve Španělsku nebo v Dubaji z vlastních zdrojů, tyto transakce se nepropisují do českých bankovních registrů (BRKI/NRKI). Dává to smysl zejména investorům, kteří chtějí diverzifikovat jak měnové, tak politické riziko domácího trhu.</p>
      <p>Rok 2026 není koncem investování. Je koncem amatérského investování. Vyžaduje promyšlenou finanční architekturu a spolupráci se špičkovými brokery.</p>
    `,
  },
  {
    id: 5,
    title: "Proč se Bali stalo magnetem pro digitální nomády",
    excerpt:
      "Vysoké výnosy vs. Leasehold. Jak bezpečně investovat do vil na ostrově bohů.",
    category: "Zahraniční trhy",
    targetCountry: "Bali (Indonésie)",
    readTime: "9 min čtení",
    date: "3. července 2026",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    featured: false,
    content: `
      <p>Bali zažívá bezprecedentní boom. Kombinace tropického klimatu, levného života a globálního přechodu na remote work vytvořila trh, kde prémiové vily mizí z nabídky dřív, než je developer stihne dokončit. Pro českého investora je to příležitost s ROI 10–15 %, ale i past plná legislativních pastí.</p>

      <h3>Leasehold: Nejrozšířenější a nejbezpečnější cesta</h3>
      <p>Cizinec nemůže přímo vlastnit indonéskou půdu. Řešením je <strong>leasehold</strong> — koupě práva užívat a pronajímat vilu na 25–30 let s možností prodloužení. Vstupní kapitál je nižší než u freeholdu a výnosy z pronájmu se vám investici vrátí za 6–8 let.</p>

      <h3>Kde kupovat v roce 2026</h3>
      <p>Přeplněné Canggu už nedává smysl. Chytré peníze míří do <strong>Pererenan, Seseh, Uluwatu a Ubud</strong>, kde ceny pozemků rostou, ale poptávka po ubytování ještě rychleji. Due diligence na titul pozemku a délku leasehold je absolutní nutnost.</p>

      <h3>Financování z ČR</h3>
      <p>Indonéské banky cizincům nepůjčí. Nejefektivnější strategií je americká hypotéka se zástavou české nemovitosti — získáte miliony korun za český úrok a pošlete je do Indonésie jako hotovostní kupec.</p>
    `,
  },
];

export function getFeaturedArticle(): Article | undefined {
  return articlesData.find((article) => article.featured);
}

export function getArticleById(id: number): Article | undefined {
  return articlesData.find((article) => article.id === id);
}

export function getArticlesByCategory(
  category: ArticleCategory | "Vše",
  excludeFeatured = true
): Article[] {
  return articlesData.filter((article) => {
    if (excludeFeatured && article.featured) return false;
    if (category === "Vše") return true;
    return article.category === category;
  });
}
