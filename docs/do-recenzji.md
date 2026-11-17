# Do recenzji merytorycznej

> Lista zadań, których **nie wolno** pokazywać uczniowi w obecnej formie.
> Znalezione automatycznie przez `npm run audit:cke` (17.11.2026).
> Każde wymaga decyzji człowieka: poprawić rozwiązanie albo usunąć zadanie.
> Po zamknięciu całej listy uruchom `npm run audit:cke -- --strict` w CI.

## Artefakty rozumowania LLM (7)

| Sesja | Zadanie | Co jest nie tak | Decyzja |
|---|---|---|---|
| m15-maj | 12 | rozwiązanie liczy przedział „od −10 do 10”, którego nie ma w treści (treść jest obrazkiem); odpowiedź może być błędna | do sprawdzenia |
| m16-maj | 22 | sprzeczne: „Odpowiedź: D” przy wyliczonym $p=0{,}375$ i komentarzu „żadna z opcji nie jest idealna”; brak sensownej opcji w treści | do sprawdzenia |
| m17-maj | 17 | w rozwiązaniu widać ślad poprawek („(ponownie)”) i niespójny wynik $BC=\frac{\sqrt6}{2}a$ z opcjami | do sprawdzenia |
| m20-czerwiec | 2 | trzy różne odpowiedzi w jednym rozwiązaniu, kończy się „Poprawna odpowiedź to $2^{60}$…”, której nie ma w opcjach | do sprawdzenia |
| m21-maj | 30 | rozwiązanie przyznaje „Nie jest to bezpośrednia droga”, potem poprawia się w trakcie | do sprawdzenia |
| m21-probna | 26 | jawne „Przepraszam, popełniłem błąd w kroku 3”, potem liczy od nowa | do sprawdzenia |
| m22-maj | 13 | „Oops! Zrobiłem błąd…”, „mogłem źle odczytać wzór z obrazka”, brak zgodności z opcjami | do sprawdzenia |

## Zadania z obrazkiem zamiast treści (322 w archiwum)

Prompt to sam `![Zadanie N](...png)`, więc kategoria wpada w domyślną
`algebra`, a wyszukiwarka i audyty nie widzą treści. Priorytet: dodać OCR /
alt-text i poprawne działy (osobne zadanie w planie, P2).

## Jak zamykać pozycję

1. Przeczytaj treść i klucz CKE.
2. Popraw `rozwiazanie` w `data/cke-matura-cache/<sesja>.json`.
3. Uruchom `npm run seed:exam-archive`, potem `npm run audit:cke -- --strict`.
4. Odhacz w tabeli (albo usuń wiersz) i dopisz datę.
