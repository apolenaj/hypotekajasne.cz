export const unifiedDestinations: {
  country: string;
  desc: string;
  image: string;
  slug: string;
}[] = [
  {
    country: "Česká republika",
    desc: "Domácí trh s regulací ČNB, stabilní LTV a nabídkou produktů u sledovaných bank.",
    image:
      "https://images.pexels.com/photos/126292/pexels-photo-126292.jpeg?auto=compress&cs=tinysrgb&w=1000",
    slug: "ceska-republika",
  },
  {
    country: "SAE (Dubaj)",
    desc: "Bez daně z příjmu fyzických osob v běžném režimu; vyšší provozní i regulatorní riziko.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    slug: "dubaj",
  },
  {
    country: "Španělsko",
    desc: "Trh v EU s financováním pro nerezidenty; výnos závisí na lokalitě a regulaci pronájmů.",
    image:
      "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1000",
    slug: "spanelsko",
  },
  {
    country: "Itálie",
    desc: "Výrazné regionální rozdíly mezi severem a jihem; delší právní proces koupě.",
    image:
      "https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=1000",
    slug: "italie",
  },
  {
    country: "Chorvatsko",
    desc: "Schengen a eurozóna; sezónnost přímořských trhů ovlivňuje výnos z pronájmu.",
    image:
      "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=1000",
    slug: "chorvatsko",
  },
  {
    country: "Bali (Indonésie)",
    desc: "Pro cizince typicky leasehold; výnosy i právní struktura vyžadují due diligence.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    slug: "bali",
  },
  {
    country: "Saúdská Arábie",
    desc: "Trh pod Vision 2030; podmínky vlastnictví a financování pro cizince ověřujeme individuálně.",
    image:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    slug: "saudska-arabie",
  },
  {
    country: "Slovensko",
    desc: "Eurozóna a blízký právní rámec EU; hypoteční sazby zde nejsou live.",
    image:
      "https://images.pexels.com/photos/3322194/pexels-photo-3322194.jpeg?auto=compress&cs=tinysrgb&w=1000",
    slug: "slovensko",
  },
];

export type UnifiedDestination = (typeof unifiedDestinations)[number];
