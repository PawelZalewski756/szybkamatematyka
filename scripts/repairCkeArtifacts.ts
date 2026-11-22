/**
 * Ręczna naprawa 7 rozwiązań CKE, w których model zostawił ślady
 * autorekorekty („przepraszam”, „poprawiam”, „ponownie”).
 *
 *   npx tsx scripts/repairCkeArtifacts.ts
 */
import fs from "node:fs";
import path from "node:path";

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-matura-cache");

const FIXES: Record<string, Record<number, string>> = {
  "m15-maj": {
    12: [
      "**Krok 1.** Odczytujemy nierówność z rysunku: $\\frac{2}{7} < \\frac{x}{14} < \\frac{4}{3}$.",
      "**Krok 2.** Mnożymy wszystkie części przez $14$ (liczba dodatnia, więc znaki się nie zmieniają): $4 < x < \\frac{56}{3}$.",
      "**Krok 3.** Ponieważ $\\frac{56}{3}=18\\frac{2}{3}$, szukamy liczb całkowitych większych od $4$ i mniejszych od $18\\frac{2}{3}$.",
      "**Krok 4.** Są to liczby $5,6,\\ldots,18$. Jest ich $18-5+1=14$.",
      "**Odpowiedź:** A) $14$.",
    ].join("\n"),
  },
  "m16-maj": {
    22: [
      "**Krok 1.** Wszystkich wyników trzech rzutów monetą jest $2^3=8$.",
      "**Krok 2.** Dokładnie dwa orły otrzymujemy w wynikach $OO R$, $O R O$, $R O O$ - są $3$ takie wyniki.",
      "**Krok 3.** Zatem $p=\\frac{3}{8}=0{,}375$.",
      "**Krok 4.** $0{,}375 \\ge 0{,}35$, więc poprawna jest odpowiedź C.",
      "**Odpowiedź:** C) $p \\ge 0{,}35$.",
    ].join("\n"),
  },
  "m17-maj": {
    17: [
      "**Krok 1.** Kąt przy wierzchołku $A$ ma miarę $30^\\circ$, a kąt przy $B$ jest prosty. Trzeci kąt ma więc $60^\\circ$ - trójkąt jest prostokątny o kątach $30^\\circ,60^\\circ,90^\\circ$.",
      "**Krok 2.** Bok $BC=a$ leży naprzeciw kąta $30^\\circ$, więc jest najkrótszym bokiem. Przeciwprostokątna $AC=2a$.",
      "**Krok 3.** Z twierdzenia Pitagorasa: $AB^2+BC^2=AC^2$, czyli $AB^2+a^2=(2a)^2=4a^2$, więc $AB=a\\sqrt{3}$.",
      "**Krok 4.** Obwód: $AB+BC+AC=a\\sqrt{3}+a+2a=(3+\\sqrt{3})a$.",
      "**Odpowiedź:** C) $(3+\\sqrt{3})a$.",
    ].join("\n"),
  },
  "m20-czerwiec": {
    2: [
      "**Krok 1.** Odczytujemy z rysunku wyrażenie $\\frac{2^{50}\\cdot 3^{40}}{36^{10}}$.",
      "**Krok 2.** Rozkładamy $36=2^2\\cdot 3^2$, więc $36^{10}=2^{20}\\cdot 3^{20}$.",
      "**Krok 3.** Dzielimy potęgi o tych samych podstawach: $\\frac{2^{50}\\cdot 3^{40}}{2^{20}\\cdot 3^{20}}=2^{50-20}\\cdot 3^{40-20}=2^{30}\\cdot 3^{20}$.",
      "**Odpowiedź:** C) $2^{30}\\cdot 3^{20}$.",
    ].join("\n"),
  },
  "m21-maj": {
    30: [
      "**Krok 1.** Mamy wykazać, że dla dodatnich $a<b$ i $c>0$ zachodzi $\\frac{a}{b}<\\frac{a+c}{b+c}$.",
      "**Krok 2.** Obie strony są dodatnie, więc mnożymy nierówność przez $b(b+c)>0$: $a(b+c)<b(a+c)$.",
      "**Krok 3.** Rozwijamy: $ab+ac<ab+bc$, czyli $ac<bc$.",
      "**Krok 4.** Dzielimy przez $c>0$: $a<b$, a to jest założenie. Przekształcenia były równoważne, więc nierówność jest prawdziwa.",
      "**Odpowiedź:** dowód przez równoważne przekształcenia i założenie $a<b$.",
    ].join("\n"),
  },
  "m21-probna": {
    26: [
      "**Krok 1.** Liczba jest trzycyfrowa i parzysta, więc jej cyfra jedności należy do $\\{0,2,4,6,8\\}$.",
      "**Krok 2.** Cyfra $7$ występuje dokładnie raz. Rozpatrujemy położenie tej cyfry.",
      "**Krok 3.** $7$ na miejscu setek: cyfra dziesiątek - $9$ możliwości (bez $7$), cyfra jedności - $5$ możliwości. Razem $1\\cdot 9\\cdot 5=45$.",
      "**Krok 4.** $7$ na miejscu dziesiątek: cyfra setek - $8$ możliwości (bez $0$ i $7$), cyfra jedności - $5$ możliwości. Razem $8\\cdot 1\\cdot 5=40$.",
      "**Krok 5.** $7$ na miejscu jedności nie daje liczby parzystej, więc ten przypadek odpada.",
      "**Krok 6.** Łącznie $45+40=85$ liczb.",
      "**Odpowiedź:** A) $85$.",
    ].join("\n"),
  },
  "m22-maj": {
    13: [
      "**Krok 1.** Upraszczamy wzór: $a_n=\\frac{2n^2-30n}{n}=2n-30$ dla $n\\ge 1$.",
      "**Krok 2.** Podstawiamy $n=7$: $a_7=2\\cdot 7-30=14-30=-16$.",
      "**Odpowiedź:** D) $-16$.",
    ].join("\n"),
  },
};

let changed = 0;
for (const [sessionId, fixes] of Object.entries(FIXES)) {
  const file = path.join(CACHE_DIR, `${sessionId}.json`);
  const sheet = JSON.parse(fs.readFileSync(file, "utf8")) as {
    tasks: { numer: number; rozwiazanie: string }[];
  };
  for (const task of sheet.tasks) {
    const next = fixes[task.numer];
    if (!next) continue;
    task.rozwiazanie = next;
    changed += 1;
  }
  fs.writeFileSync(file, JSON.stringify(sheet, null, 2) + "\n", "utf8");
  console.log(`✓ ${sessionId}.json`);
}

console.log(`\nNaprawiono ${changed} rozwiązań.`);
