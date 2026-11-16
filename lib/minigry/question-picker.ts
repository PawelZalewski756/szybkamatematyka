/**
 * Wybiera pytanie, którego nie było jeszcze w bieżącej sesji.
 * Jeśli pula się wyczerpie (np. gra ma 3 pytania), czyści pamięć i wraca
 * do pierwszego kandydata, żeby runda nigdy nie stanęła.
 */
export function pickUnseenQuestion<T extends { id: string }>(
  generate: () => T,
  seen: Set<string>,
  maxAttempts = 30,
): T {
  let fallback: T | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const question = generate();
    if (!fallback) fallback = question;
    if (!seen.has(question.id)) {
      seen.add(question.id);
      return question;
    }
  }

  seen.clear();
  if (fallback) {
    seen.add(fallback.id);
    return fallback;
  }
  return generate();
}
