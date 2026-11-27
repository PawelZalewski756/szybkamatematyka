# Do recenzji merytorycznej

> Lista zadań, których **nie wolno** pokazywać uczniowi w obecnej formie.
> Znalezione automatycznie przez `npm run audit:cke` (17.11.2026),
> uzupełnione 18.11.2026.

## Artefakty rozumowania LLM - naprawione 18.11.2026

Wszystkie 7 rozwiązań zostało przepisanych ręcznie w
`data/cke-matura-cache/*.json` przez `scripts/repairCkeArtifacts.ts`.
`npm run audit:cke -- --strict` przechodzi bez ostrzeżeń. Poniższa tabela
zostaje jako ślad, co było nie tak.

| Sesja | Zadanie | Co było nie tak | Status |
|---|---|---|---|
| m15-maj | 12 | rozwiązanie liczyło przedział „od −10 do 10”, którego nie ma w treści (treść jest obrazkiem) | **naprawione**: odczyt $2/7<x/14<4/3$, wynik 14 |
| m16-maj | 22 | sprzeczne: „Odpowiedź: D” przy $p=0{,}375$ i komentarzu „żadna z opcji nie jest idealna” | **naprawione**: $p=3/8=0{,}375$, odpowiedź C |
| m17-maj | 17 | ślad poprawek („(ponownie)”) i niespójny wynik $BC=\frac{\sqrt6}{2}a$ z opcjami | **naprawione**: trójkąt 30-60-90, obwód $(3+\sqrt3)a$ |
| m20-czerwiec | 2 | trzy różne odpowiedzi w jednym rozwiązaniu, kończyło się wynikiem spoza opcji | **naprawione**: $(2^{50}\cdot3^{40})/36^{10}=2^{30}\cdot3^{20}$ |
| m21-maj | 30 | rozwiązanie przyznawało „Nie jest to bezpośrednia droga”, potem poprawiało się w trakcie | **naprawione**: dowód przez równoważne przekształcenia |
| m21-probna | 26 | jawne „Przepraszam, popełniłem błąd w kroku 3”, potem liczenie od nowa | **naprawione**: 45+40=85, odpowiedź A |
| m22-maj | 13 | „Oops! Zrobiłem błąd…”, „mogłem źle odczytać wzór z obrazka” | **naprawione**: $a_n=2n-30$, $a_7=-16$, odpowiedź D |

## Zadania z obrazkiem zamiast treści (322 w archiwum)

Prompt to sam `![Zadanie N](...png)`, więc kategoria wpada w domyślną
`algebra`, a wyszukiwarka i audyty nie widzą treści. Priorytet: dodać OCR /
alt-text i poprawne działy (osobne zadanie w planie, P2). To nie są błędy
rozwiązań - brakuje tekstu zadania, więc nie da się ich poprawnie
przypisać do działu.

## Jak zamykać pozycję

1. Przeczytaj treść i klucz CKE.
2. Popraw `rozwiazanie` w `data/cke-matura-cache/<sesja>.json`.
3. Uruchom `npm run seed:exam-archive`, potem `npm run audit:cke -- --strict`.
4. Odhacz w tabeli (albo usuń wiersz) i dopisz datę.
