export interface CzGuideArticle {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  content: string;
}

export const czGuideArticlesData: CzGuideArticle[] = [
  {
    id: 1,
    category: "Základy",
    title: "Jak funguje LTV a vlastní zdroje",
    excerpt:
      "LTV až 90 % je standard, ale nižší poměr úvěru znamená lepší sazbu a vyšší šanci na schválení.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    readTime: "4 min čtení",
    content: `
      <p>Zkratka LTV (Loan-to-Value) je magické číslo každé hypotéky. Vyjadřuje procentuální poměr mezi výší půjčky a zástavní hodnotou nemovitosti. Česká národní banka aktuálně omezuje maximální LTV na 90 % (pro žadatele do 36 let) a 80 % pro ostatní.</p>
      <h3>Proč na LTV tolik záleží?</h3>
      <p>Nejde jen o to, kolik musíte mít naspořeno. LTV přímo určuje rizikovou přirážku banky. Pokud žádáte o 80% hypotéku, banka nese menší riziko, než když žádáte o 90%. Získáváte tak:</p>
      <ul>
        <li><strong>Nižší úrokovou sazbu:</strong> Rozdíl mezi 80% a 90% LTV může dělat i 0,3 - 0,5 % na úroku.</li>
        <li><strong>Vyšší šanci na schválení:</strong> U nižšího LTV jsou banky benevolentnější při posuzování vašich dalších výdajů.</li>
      </ul>
      <h3>Kde vzít vlastní zdroje?</h3>
      <p>Kromě hotovosti na účtu můžete jako vlastní zdroj použít i dozajištění jinou nemovitostí (např. bytem rodičů). Tím LTV uměle snížíte, často i na méně než 50 %, čímž dosáhnete na ty absolutně nejlepší VIP sazby na trhu.</p>
    `,
  },
  {
    id: 2,
    category: "Sazby",
    title: "Fixace vs. variabilní sazba",
    excerpt:
      "Kdy se vyplatí fixace na 5 nebo 10 let a jak se připravit na refixaci.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    readTime: "5 min čtení",
    content: `
      <p>Dilema, které řeší každý žadatel o úvěr. Zafixovat si jistotu na 10 let, nebo zariskovat a nechat si prostor pro pokles sazeb? Výběr správné fixace vám může ušetřit statisíce korun, ale také vás do nich může stát.</p>
      <h3>Pravidla pro volbu fixace v současném trhu</h3>
      <ul>
        <li><strong>Klesající trh (Očekává se snižování sazeb):</strong> Volte kratší fixace (1 až 3 roky). Až sazby klesnou, budete moci úvěr levně refinancovat. V takovém prostředí dává smysl i variabilní (plovoucí) sazba vázaná na PRIBOR, pokud snesete krátkodobé výkyvy.</li>
        <li><strong>Rostoucí trh (Inflační tlaky):</strong> Pokud úroky rostou, 5letá či 10letá fixace funguje jako finanční štít. Zamknete si splátku a růst sazeb vás nemusí zajímat.</li>
      </ul>
      <h3>Mýtus o sankcích za předčasné splacení</h3>
      <p>Podle nových pravidel platných od září 2024 banky mohou účtovat poplatek za předčasné splacení (až 1 % za každý rok do konce fixace, max. však 2 %). Dlouhá fixace už tedy není tak "bezpečná" pro případ, že byste chtěli hypotéku refinancovat ke konkurenci, jak tomu bylo dříve. Pečlivě proto zvažte, jak dlouho si nemovitost reálně plánujete nechat.</p>
    `,
  },
  {
    id: 3,
    category: "Regulace",
    title: "Limity ČNB a DSTI",
    excerpt:
      "Jak centrální banka omezuje maximální splátku a co to znamená pro vaši bonitu.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    readTime: "6 min čtení",
    content: `
      <p>Koupě nemovitosti už dávno není jen o dohodě mezi vámi a bankéřem. Do hry vstupuje mocný hráč – Česká národní banka (ČNB), která diktuje přísná pravidla hry, aby zabránila předlužení domácností.</p>
      <h3>Co je to DSTI a DTI?</h3>
      <p>Zatímco limit LTV určuje, kolik vlastních peněz potřebujete, ukazatele DSTI a DTI hodnotí vaše příjmy:</p>
      <ul>
        <li><strong>DTI (Debt-to-Income):</strong> Váš celkový dluh nesmí přesáhnout určitý násobek vašeho čistého ročního příjmu (historicky např. 8,5x nebo 9,5x).</li>
        <li><strong>DSTI (Debt Service-to-Income):</strong> Součet <em>všech</em> vašich měsíčních splátek (hypotéka, leasing, spotřebitelské úvěry) nesmí spolknout více než určité procento vaší čisté měsíční mzdy (často limitováno na 45–50 %).</li>
      </ul>
      <h3>Jak tyto limity legálně obejít?</h3>
      <p>Pokud "nevyjdete" do tabulek, nejste bez šance. Nejčastějším řešením je přizvání <strong>spolužadatele</strong> (partnera, rodiče), čímž se vaše příjmy sečtou. Další možností pro investory je přesun nákupu na <strong>právnickou osobu (s.r.o.)</strong>, kde se firemní úvěry často řídí jinou, benevolentnější metodikou nezávislou na limitech pro fyzické osoby.</p>
    `,
  },
];

export function getCzGuideArticleById(id: number): CzGuideArticle | undefined {
  return czGuideArticlesData.find((article) => article.id === id);
}
