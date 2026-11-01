const PROFANITY_TERMS = [
  "kurwa",
  "kurwy",
  "kurew",
  "kurwis",
  "chuj",
  "chuja",
  "chuje",
  "chujek",
  "jebac",
  "jebie",
  "jebal",
  "jebany",
  "jebana",
  "jebane",
  "jebani",
  "pierdol",
  "pizda",
  "pizdy",
  "pizd",
  "sukinsyn",
  "skurwysyn",
  "skurw",
  "spierdal",
  "wypierdal",
  "zajeb",
  "odpierd",
  "dupa",
  "dupy",
  "dupe",
  "cwel",
  "debil",
  "idiota",
  "kretyn",
  "szmata",
  "pedal",
  "ciota",
  "fuck",
  "fucker",
  "shit",
  "crap",
  "bitch",
  "bastard",
  "asshole",
  "dumbass",
  "moron",
  "loser",
  "dick",
  "cock",
  "prick",
  "pussy",
  "cunt",
  "motherfucker",
  "bullshit",
  "piss",
  "pissing",
  "slut",
  "whore",
] as const;

const LEET_REPLACEMENTS: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "@": "a",
  $: "s",
  "!": "i",
};

function normalizeForProfanityCheck(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(
      /[01345@$!]/g,
      (character) => LEET_REPLACEMENTS[character] ?? character,
    )
    .replace(/[^a-z0-9]/g, "");
}

export function containsProfanity(value: string): boolean {
  const normalized = normalizeForProfanityCheck(value);
  return PROFANITY_TERMS.some((term) => normalized.includes(term));
}
