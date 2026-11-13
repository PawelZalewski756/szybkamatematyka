/**
 * Naprawa uszkodzonego tekstu matematycznego ($...$ / $$...$$).
 *
 * Treści zadań i lekcji pochodzą z kilku źródeł (Gemini, cache, OCR arkuszy CKE)
 * i regularnie trafiają do bazy z dwoma klasami błędów:
 *
 *  1. „Zjedzone” komendy LaTeX. Model oddaje JSON z pojedynczym ukośnikiem
 *     (`"\times"`, `"\frac"`, `"\theta"`), a parser JSON widzi poprawne sekwencje
 *     `\t`, `\f`, `\b`, `\r`, `\n` i zamienia je na znaki sterujące. Wtedy
 *     `5\times3` staje się `5<TAB>imes3` i użytkownik widzi `5imes3`.
 *
 *  2. Niedomknięte lub nadmiarowe `$`. Pojedynczy `$` na końcu albo `$$` po
 *     zamykającym `$` powoduje, że KaTeX dostaje `$` w środku formuły (czerwony
 *     błąd) albo cała formuła przestaje być matematyką i renderuje się jako surowy
 *     LaTeX (`\div`, `\times`).
 *
 * Moduł jest defensywny i idempotentny: poprawne treści przechodzą bez zmian,
 * a naprawiamy tylko to, co da się naprawić bez zgadywania sensu zadania.
 */

export type MathSegment =
  | { kind: "text"; text: string }
  | { kind: "inline"; latex: string }
  | { kind: "display"; latex: string };

/**
 * Komendy LaTeX, które mogą zostać uszkodzone przez interpretację `\t`, `\f`,
 * `\b`, `\r`, `\n`, `\v` jako sekwencji ucieczki. Zbiór zawiera też nazwy
 * używane w treściach zadań (CKE, Gemini, teoria), żeby rozpoznawać je w całości.
 */
export const LATEX_COMMANDS: ReadonlySet<string> = new Set([
  // symbole i operatory
  "times", "div", "cdot", "pm", "mp", "ast", "star", "circ", "bullet", "oplus",
  "otimes", "odot", "le", "leq", "leqslant", "ge", "geq", "geqslant", "ne",
  "neq", "approx", "equiv", "sim", "simeq", "cong", "propto", "infty", "partial",
  "nabla", "forall", "exists", "nexists", "emptyset", "varnothing", "in",
  "notin", "ni", "subset", "subseteq", "supset", "supseteq", "cup", "cap",
  "setminus", "complement", "land", "lor", "neg", "lnot", "to", "rightarrow",
  "leftarrow", "Rightarrow", "Leftarrow", "leftrightarrow", "Leftrightarrow",
  "longleftarrow", "longrightarrow", "mapsto", "implies", "iff", "therefore",
  "because", "angle", "measuredangle", "triangle", "square", "perp", "parallel",
  "langle", "rangle", "lceil", "rceil", "lfloor", "rfloor", "ldots", "cdots",
  "vdots", "ddots", "dots", "dotsb", "dotsc", "dotsi", "dotsm", "dotso", "quad",
  "qquad", "enspace", "thinspace", "negthinspace", "left", "right", "big", "Big",
  "bigg", "Bigg", "bigl", "bigr", "Bigl", "Bigr", "displaystyle", "textstyle",
  "limits", "nolimits", "nleq", "ngeq", "nsim", "ncong", "nsubset", "nsubseteq",
  "nsupset", "nsupseteq", "nmid", "nparallel", "nrightarrow", "nleftarrow",
  "nRightarrow", "nLeftarrow", "nleftrightarrow", "nvdash", "nvDash", "nVdash",
  "not", "textstyle", "hline", "hbar", "newline", "cr", "noindent", "tag",
  "nonumber", "notag", "varnothing", "vDash", "vdash", "upharpoonright",
  "uparrow", "updownarrow", "Uparrow", "uplus", "unrhd", "underrightarrow",
  "frown", "flat", "between", "bowtie", "barwedge", "backslash",
  // funkcje i struktury
  "sin", "cos", "tan", "cot", "tg", "ctg", "sec", "csc", "arcsin", "arccos",
  "arctan", "arctg", "sinh", "cosh", "tanh", "coth", "log", "ln", "lg", "lim",
  "sup", "inf", "det", "gcd", "max", "min", "exp", "deg", "arg", "mod", "bmod",
  "pmod", "operatorname", "text", "textbf", "textit", "textrm", "textsf",
  "texttt", "textnormal", "textup", "textmd", "textcolor", "color", "underline",
  "overline", "overbrace", "underbrace", "hat", "widehat", "tilde",
  "widetilde", "bar", "vec", "dot", "ddot", "frac", "dfrac", "tfrac", "binom",
  "dbinom", "tbinom", "sqrt", "root", "sum", "prod", "int", "oint", "iint",
  "iiint", "mathbb", "mathcal", "mathrm", "mathbf", "mathit", "mathsf",
  "mathtt", "mathfrak", "boxed", "fbox", "cancel", "bcancel", "xcancel",
  "stackrel", "overset", "underset", "brace", "brack", "choose", "over",
  "atop", "coloneqq", "eqqcolon", "textsuperscript", "textsubscript",
  // greckie litery
  "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta",
  "theta", "vartheta", "iota", "kappa", "varkappa", "lambda", "mu", "nu", "xi",
  "omicron", "pi", "varpi", "rho", "varrho", "sigma", "varsigma", "tau",
  "upsilon", "phi", "varphi", "chi", "psi", "omega", "Gamma", "Delta", "Theta",
  "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega",
]);

/** Znak sterujący → litera, którą „zjadła” interpretacja sekwencji ucieczki. */
const ESCAPE_LETTERS: Record<string, string> = {
  "\u0008": "b",
  "\u0009": "t",
  "\u000A": "n",
  "\u000B": "v",
  "\u000C": "f",
  "\u000D": "r",
};

/** Znaki sterujące, które nigdy nie występują naturalnie w treści. */
const NEVER_NATURAL = new Set(["\u0008", "\u000B", "\u000C", "\u000D"]);

/**
 * Czy tekst zawiera znaną komendę LaTeX? Samo `\n` w tekście (dosłowne
 * „backslash n” z podwójnie zakodowanego JSON-a) nie jest komendą i nie może
 * zamieniać prozy typu `...\nMnożenie` w matematykę.
 */
export function containsLatexCommand(text: string): boolean {
  if (!text.includes("\\")) return false;
  for (const match of text.matchAll(/\\([a-zA-Z]+)/g)) {
    if (LATEX_COMMANDS.has(match[1]!)) return true;
  }
  return false;
}
const FENCED_CODE_RE = /(^```[\s\S]*?^```[ \t]*$)/gm;

function isEscaped(text: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && text[i] === "\\"; i -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

export function isKnownLatexCommand(name: string): boolean {
  return LATEX_COMMANDS.has(name);
}

/** Znaki, po których komenda LaTeX na pewno jest matematyką. */
const MATH_FOLLOWER_RE = /^[ \t\n$\\{}\[\d^_=<>+\-*/|!~]$/;

/**
 * Odtwarza ukośnik przed komendami LaTeX, które parser JSON zamienił na znaki
 * sterujące (`\times` → TAB + `imes`, `\frac` → FF + `rac`, ...).
 *
 * Naprawiamy tylko wtedy, gdy po znaku sterującym powstaje pełna, znana nazwa
 * komendy. Nowa linia (`\n`) jest znakiem naturalnym, więc dodatkowo wymagamy
 * matematycznego kontekstu - inaczej listy `\ne)` / `\nd)` zamieniłyby się
 * w `\ne` / `\nd`.
 */
export function repairLatexControlChars(text: string): string {
  if (
    !/[\u0008\u0009\u000B\u000C\u000D]/.test(text) &&
    !/\n[a-z]/.test(text)
  ) {
    return text;
  }

  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text.charAt(i);
    const letter = ESCAPE_LETTERS[char];
    if (!letter) {
      out += char;
      continue;
    }

    const rest = /^[a-z]+/.exec(text.slice(i + 1))?.[0] ?? "";
    if (rest && LATEX_COMMANDS.has(letter + rest)) {
      const following = text.charAt(i + 1 + rest.length);
      const mathFollower = following === "" || MATH_FOLLOWER_RE.test(following);
      // Tabulator i nowa linia są naturalne w tekście („...\ni tworzenie”,
      // „...\ne) ...”): uznajemy je za komendę tylko przy jednoznacznym
      // kontekście matematycznym i nazwie dłuższej niż 2 znaki.
      const natural = char === "\t" || char === "\n";
      const allowed = natural ? rest.length >= 2 && mathFollower : true;
      if (allowed) {
        out += `\\${letter}${rest}`;
        i += rest.length;
        continue;
      }
    }

    if (NEVER_NATURAL.has(char)) {
      out += " ";
      continue;
    }

    out += char;
  }

  return out;
}

/**
 * Usuwa niedomknięte i nadmiarowe `$`.
 *
 * Reguły:
 *  - `$formuła$$` → `$formuła$` (nadmiarowy `$` po zamknięciu),
 *  - `$$formuła$$$` → `$$formuła$$`,
 *  - `$formuła` bez zamknięcia → domykamy na końcu linii (`$formuła$`),
 *  - pojedynczy `$` w zwykłym tekście (np. waluta) zostaje bez zmian.
 */
export function balanceMathDelimiters(text: string): string {
  if (!text.includes("$")) return text;

  const dollars: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "$" && !isEscaped(text, i)) dollars.push(i);
  }
  if (dollars.length === 0) return text;

  // Pojedynczy `$` bywa znakiem waluty - nie domykamy go, gdy wygląda na cenę.
  if (dollars.length === 1) {
    const position = dollars[0]!;
    const before = text.slice(0, position);
    const after = text.slice(position + 1);
    const priceAfter = /^\s*\d+(?:[.,]\d+)?\s*(?:zł|pln|eur|€)?\s*[.!?]?\s*$/iu.test(after);
    const priceBefore = /\d\s*$/u.test(before);
    if (priceAfter || priceBefore) return text;
  }

  const drop = new Set<number>();
  const insertAfter = new Map<number, string>();
  let open: { kind: "inline" | "display"; start: number } | null = null;

  let i = 0;
  while (i < text.length) {
    if (text[i] !== "$" || isEscaped(text, i)) {
      i += 1;
      continue;
    }

    const isDouble = text[i + 1] === "$";
    const kind = isDouble ? "display" : "inline";

    if (!open) {
      open = { kind, start: i };
      i += isDouble ? 2 : 1;
      continue;
    }

    if (open.kind === kind) {
      open = null;
      i += isDouble ? 2 : 1;
      continue;
    }

    if (open.kind === "inline" && isDouble) {
      // Pierwszy `$` zamyka formułę, drugi zostaje i za chwilę zostanie odrzucony.
      open = null;
      i += 1;
      continue;
    }

    // Otwarte `$$` i samotny `$` - traktujemy samotny znak jako śmieć.
    drop.add(i);
    i += 1;
  }

  if (open) {
    const closer = open.kind === "display" ? "$$" : "$";
    const lineEnd = text.indexOf("\n", open.start);
    const stop = lineEnd === -1 ? text.length : lineEnd;
    const isEmpty = text.slice(open.start + closer.length, stop).trim() === "";
    const gluedToPrevious = text.charAt(open.start - 1) === "$";

    if (isEmpty || gluedToPrevious) {
      // Np. `$...$$` albo samotny `$` na końcu - to nadmiarowy znak.
      for (let k = 0; k < closer.length; k += 1) drop.add(open.start + k);
    } else {
      // Niedomknięta formuła: domykamy ją na końcu tej samej linii.
      insertAfter.set(stop - 1, closer);
    }
  }

  if (drop.size === 0 && insertAfter.size === 0) return text;

  let out = "";
  for (let index = 0; index < text.length; index += 1) {
    if (!drop.has(index)) out += text[index];
    const insertion = insertAfter.get(index);
    if (insertion) out += insertion;
  }
  return out;
}

/** `\(...\)` → `$...$` oraz `\[...\]` → `$$...$$`. */
export function convertLatexDelimiters(text: string): string {
  if (!text.includes("\\(") && !text.includes("\\[") && !text.includes("\\)") && !text.includes("\\]")) {
    return text;
  }
  return text
    .replace(/\\\[/g, "$$$$")
    .replace(/\\\]/g, "$$$$")
    .replace(/\\\(/g, "$$")
    .replace(/\\\)/g, "$$");
}

/**
 * Dzieli tekst na segmenty tekstowe i matematyczne. Pary `$...$` /
 * `$$...$$` muszą być już zbalansowane (robi to `balanceMathDelimiters`).
 */
export function scanMathSegments(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let text = "";
  const flush = () => {
    if (text) {
      segments.push({ kind: "text", text });
      text = "";
    }
  };

  let i = 0;
  while (i < input.length) {
    const char = input.charAt(i);

    if (char === "\\" && input[i + 1] === "$") {
      text += "$";
      i += 2;
      continue;
    }

    if (char !== "$") {
      text += char;
      i += 1;
      continue;
    }

    if (input[i + 1] === "$") {
      let end = i + 2;
      while (end < input.length && (input[end] !== "$" || isEscaped(input, end))) {
        end += 1;
      }
      if (end + 1 < input.length && input[end + 1] === "$") {
        flush();
        segments.push({ kind: "display", latex: input.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
      text += "$$";
      i += 2;
      continue;
    }

    let end = i + 1;
    while (end < input.length && (input[end] !== "$" || isEscaped(input, end))) {
      end += 1;
    }
    if (end < input.length && end > i + 1) {
      flush();
      segments.push({ kind: "inline", latex: input.slice(i + 1, end) });
      i = end + 1;
      continue;
    }

    text += "$";
    i += 1;
  }

  flush();
  return segments;
}

const MATH_CHUNK_RE = /^[0-9+\-*/^_=<>()[\]{}|.,;:%\\]+$/;
const SINGLE_LETTER_RE = /^[a-zA-Z]$/;
const SUBSCRIPTED_RE = /^[a-zA-Z](?:[\^_](?:\{[^{}]*\}|[0-9a-zA-Z]))+$/;
const MATH_WORD_RE =
  /^(?:sin|cos|tg|ctg|tan|cot|sec|csc|arcsin|arccos|arctg|log|ln|lg|lim|sqrt|pi|infty|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|lambda|mu|nu|xi|rho|sigma|tau|phi|chi|psi|omega|Omega|Delta|Sigma|Pi|Phi|Psi|Lambda|Theta|Gamma|Xi)$/;

function isMathToken(token: string): boolean {
  if (containsLatexCommand(token)) return true;
  if (MATH_CHUNK_RE.test(token) && /[0-9=+\-*/^_<>()[\]]/.test(token)) return true;
  return (
    SINGLE_LETTER_RE.test(token) ||
    SUBSCRIPTED_RE.test(token) ||
    MATH_WORD_RE.test(token)
  );
}

/**
 * Owicka w `$...$` fragmenty, które zawierają komendy LaTeX, ale znalazły się
 * poza formułą (np. po odrzuceniu niedomkniętego `$`). Dzięki temu wyrażenie
 * `50 - (24 \div 6 + 2 \times 5)` renderuje się jak matematyka, a nie jak tekst.
 */
export function wrapStrayLatex(text: string): string {
  if (!containsLatexCommand(text)) return text;

  const words = [...text.matchAll(/\S+/g)].map((match) => ({
    value: match[0],
    index: match.index ?? 0,
  }));

  let out = "";
  let cursor = 0;
  let i = 0;

  while (i < words.length) {
    const word = words[i]!;
    if (!containsLatexCommand(word.value)) {
      i += 1;
      continue;
    }

    let start = i;
    while (start > 0 && isMathToken(words[start - 1]!.value)) start -= 1;

    let end = i;
    while (end + 1 < words.length && isMathToken(words[end + 1]!.value)) end += 1;

    const from = words[start]!.index;
    let to = words[end]!.index + words[end]!.value.length;

    // Kropka/przecinek na końcu zdania nie powinny wchodzić do formuły.
    const trailing = /[.,;:]+$/.exec(text.slice(from, to))?.[0] ?? "";
    if (trailing) to -= trailing.length;

    const latex = text.slice(from, to).trim();
    // Owijamy tylko wtedy, gdy fragment naprawdę wygląda na działanie - samo
    // `\ne` albo `\alpha` w środku zdania zostaje jako tekst (z symbolem).
    if (!latex || !containsLatexCommand(latex) || !/\d|[=+\-*/<>^_]/.test(latex)) {
      out += text.slice(cursor, words[i]!.index + words[i]!.value.length);
      cursor = words[i]!.index + words[i]!.value.length;
      i += 1;
      continue;
    }

    out += text.slice(cursor, from);
    out += `$${latex}$`;
    cursor = to;
    i = end + 1;
  }

  out += text.slice(cursor);

  // To, czego nie udało się owinąć (np. komenda przyklejona do polskiego słowa),
  // zamieniamy na czytelne znaki - w tekście nie może zostać surowy LaTeX.
  const segments = scanMathSegments(out);
  if (
    !segments.some(
      (segment) => segment.kind === "text" && containsLatexCommand(segment.text),
    )
  ) {
    return out;
  }

  return segments
    .map((segment) => {
      if (segment.kind === "text") return latexToPlainText(segment.text);
      if (segment.kind === "display") return `$$${segment.latex}$$`;
      return `$${segment.latex}$`;
    })
    .join("");
}

const SYMBOLS: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε",
  zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ", iota: "ι", kappa: "κ",
  varkappa: "ϰ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", omicron: "ο",
  pi: "π", varpi: "ϖ", rho: "ρ", varrho: "ϱ", sigma: "σ", varsigma: "ς",
  tau: "τ", upsilon: "υ", phi: "φ", varphi: "ϕ", chi: "χ", psi: "ψ",
  omega: "ω", Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ",
  Pi: "Π", Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
  times: "×", div: "÷", cdot: "·", pm: "±", mp: "∓", ast: "∗", star: "⋆",
  le: "≤", leq: "≤", leqslant: "≤", ge: "≥", geq: "≥", geqslant: "≥",
  ne: "≠", neq: "≠", approx: "≈", equiv: "≡", sim: "∼", simeq: "≃",
  cong: "≅", propto: "∝", infty: "∞", partial: "∂", nabla: "∇",
  in: "∈", notin: "∉", ni: "∋", subset: "⊂", subseteq: "⊆", supset: "⊃",
  supseteq: "⊇", cup: "∪", cap: "∩", setminus: "∖", emptyset: "∅",
  varnothing: "∅", forall: "∀", exists: "∃", nexists: "∄", neg: "¬",
  land: "∧", lor: "∨", to: "→", rightarrow: "→", leftarrow: "←",
  Rightarrow: "⇒", Leftarrow: "⇐", leftrightarrow: "↔", Leftrightarrow: "⇔",
  mapsto: "↦", implies: "⇒", iff: "⇔", angle: "∠",
  measuredangle: "∡", triangle: "△", square: "□", perp: "⊥", parallel: "∥",
  langle: "⟨", rangle: "⟩", lceil: "⌈", rceil: "⌉", lfloor: "⌊",
  rfloor: "⌋", ldots: "…", cdots: "⋯", vdots: "⋮", ddots: "⋱", dots: "…",
  circ: "°", degree: "°", "%": "%", dollar: "$", "{": "{", "}": "}",
  "_": "_", "&": "&", "#": "#", sin: "sin", cos: "cos", tan: "tan",
  cot: "cot", tg: "tg", ctg: "ctg", arcsin: "arcsin", arccos: "arccos",
  arctg: "arctg", log: "log", ln: "ln", lg: "lg", lim: "lim", sum: "∑",
  prod: "∏", int: "∫", oint: "∮",
};

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶",
  "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽",
  ")": "⁾", n: "ⁿ", i: "ⁱ",
};

function toSuperscript(value: string): string | null {
  if (!/^[0-9+\-=()ni]+$/.test(value)) return null;
  return [...value].map((char) => SUPERSCRIPTS[char] ?? char).join("");
}

/**
 * Awaryjna zamiana LaTeX-a na czytelny tekst. Używana, gdy KaTeX nie potrafi
 * sparsować formuły - lepiej pokazać `5 × 3` niż czerwony błąd z `\times`.
 */
export function latexToPlainText(latex: string): string {
  if (!latex) return "";
  let out = latex;

  out = out
    .replace(/\\(?:left|right|bigl|bigr|Bigl|Bigr|bigg|Bigg|big|Big)\b/g, "")
    .replace(/\\(?:displaystyle|textstyle|limits|nolimits)\b/g, "")
    .replace(/\\(?:quad|qquad|enspace|thinspace|negthinspace)\b/g, " ")
    .replace(/\\[!,;:]/g, "")
    .replace(/\\ /g, " ");

  const collapseSqrt = (value: string) =>
    value
      .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
      .replace(/\\sqrt\s*([0-9a-zA-Z])/g, "√$1");

  // Pierwiastki najpierw, żeby `\frac{\sqrt{2}}{2}` rozłożyło się poprawnie.
  out = collapseSqrt(out);

  // Ułamki (także zagnieżdżone) - kilka przebiegów od najbardziej wewnętrznych.
  for (let pass = 0; pass < 6; pass += 1) {
    const next = out.replace(
      /\\(?:d|t)?frac\{([^{}]*)\}\{([^{}]*)\}/g,
      (_match, numerator: string, denominator: string) => {
        const top = /[+\-\s/]/.test(numerator.trim()) ? `(${numerator})` : numerator;
        const bottom = /[+\-\s/]/.test(denominator.trim()) ? `(${denominator})` : denominator;
        return `${top}/${bottom}`;
      },
    );
    if (next === out) break;
    out = next;
  }

  out = collapseSqrt(out);
  out = out
    .replace(/\\(?:text|textrm|textsf|texttt|textnormal|textup|textmd|mathrm|mathbf|mathit|mathsf|mathtt|mathfrak|mathcal|mathbb|operatorname|textbf|textit)\{([^{}]*)\}/g, "$1")
    .replace(/\\textcolor\{[^{}]*\}\{([^{}]*)\}/g, "$1")
    .replace(/\\color\{[^{}]*\}/g, "");

  out = out.replace(/\^\{([^{}]*)\}/g, (match, inner: string) => {
    const superscript = toSuperscript(inner.trim());
    return superscript ?? (inner.length > 1 ? `^(${inner})` : `^${inner}`);
  });
  out = out.replace(/_\{([^{}]*)\}/g, (_match, inner: string) => `_(${inner})`);
  out = out.replace(/\^([0-9+\-=ni])/g, (_match, inner: string) => toSuperscript(inner) ?? inner);
  out = out.replace(/_([0-9a-zA-Z])/g, "_$1");

  out = out.replace(/\\([a-zA-Z]+)/g, (match, name: string) => SYMBOLS[name] ?? name);
  out = out.replace(/\\/g, "");
  out = out.replace(/[{}]/g, "");
  return out.replace(/\s{2,}/g, " ").trim();
}

function mapOutsideCodeFences(text: string, fn: (plain: string) => string): string {
  if (!text.includes("```")) return fn(text);
  return text
    .split(FENCED_CODE_RE)
    .map((part, index) => (index % 2 === 1 ? part : fn(part)))
    .join("");
}

const ZERO_WIDTH_RE = /[\u200B-\u200D]/g;

const BROKEN_ENVIRONMENTS =
  "cases|aligned|align|alignat|array|pmatrix|bmatrix|vmatrix|Vmatrix|matrix|split|gathered|eqnarray";

/**
 * Naprawia resztki komend uszkodzonych przez parser JSON, gdy znak sterujący
 * został później zamieniony na spację (np. przez sanitizer albo kopiowanie):
 *   `$$ egin{cases} ...` → `$$\begin{cases} ...`
 *   `\left( ... ight)`   → `\left( ... \right)`
 *
 * Działamy tylko wewnątrz formuł i tylko na jednoznacznych wzorcach, żeby nie
 * ruszać zwykłego tekstu.
 */
export function repairDamagedMathCommands(latex: string): string {
  if (!latex) return latex;
  let out = latex;

  out = out.replace(
    new RegExp(`(^|\\s)egin\\{(${BROKEN_ENVIRONMENTS})\\}`, "g"),
    (_match, prefix: string, environment: string) =>
      `${prefix}\\begin{${environment}}`,
  );

  if (out.includes("\\left")) {
    out = out.replace(/(\s)ight(?=[\s)\]|.,;:\\])/g, "$1\\right");
    out = out.replace(/(\s)ight$/g, "$1\\right");
  }

  return out;
}

/**
 * Główna naprawa treści matematycznej. Idempotentna - można ją bezpiecznie
 * wołać wielokrotnie (render, import, naprawa bazy).
 */
export function normalizeMathText(input: string): string {
  if (!input) return input;

  return mapOutsideCodeFences(input, (plain) => {
    let text = plain.replace(ZERO_WIDTH_RE, "").replace(/\uFEFF/g, "");
    text = repairLatexControlChars(text);
    text = convertLatexDelimiters(text);
    text = balanceMathDelimiters(text);

    const segments = scanMathSegments(text);
    const rebuilt = segments
      .map((segment) => {
        if (segment.kind === "text") return wrapStrayLatex(segment.text);
        const latex = repairDamagedMathCommands(segment.latex);
        if (segment.kind === "display") return `$$${latex}$$`;
        return `$${latex}$`;
      })
      .join("");

    return rebuilt;
  });
}

/** Lista wykrytych problemów formatowania (do audytu treści). */
export function findMathTextIssues(input: string): string[] {
  if (!input) return [];
  const issues: string[] = [];

  const repaired = repairLatexControlChars(input);
  if (repaired !== input) {
    issues.push("uszkodzona sekwencja LaTeX (znak sterujący zamiast ukośnika)");
  }

  const withDelimiters = convertLatexDelimiters(repaired);
  if (withDelimiters !== repaired) {
    issues.push("delimitery \\( \\) lub \\[ \\] zamiast $");
  }

  const balanced = balanceMathDelimiters(withDelimiters);
  if (balanced !== withDelimiters) {
    issues.push("niedomknięte lub nadmiarowe $");
  }

  const outsideFences = balanced
    .split(FENCED_CODE_RE)
    .filter((_part, index) => index % 2 === 0)
    .join("");
  const segments = scanMathSegments(outsideFences);
  if (
    segments.some(
      (segment) => segment.kind === "text" && containsLatexCommand(segment.text),
    )
  ) {
    issues.push("surowy LaTeX poza $...$");
  }
  if (
    segments.some(
      (segment) =>
        segment.kind !== "text" &&
        repairDamagedMathCommands(segment.latex) !== segment.latex,
    )
  ) {
    issues.push("uszkodzona komenda LaTeX w formule (np. `egin{cases}`)");
  }

  if (/[\u200B-\u200D\uFEFF]/.test(input)) {
    issues.push("niewidoczne znaki Unicode (ZWSP/ZWNJ/BOM)");
  }

  return issues;
}
