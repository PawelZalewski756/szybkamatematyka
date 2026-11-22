/**
 * Temat „Bryły - rozpoznawanie” miał błędnie skopiowane zadania o objętości
 * z tematu „Objętość i pole powierzchni”. Tutaj wpisujemy 20 zadań
 * rozpoznawczych: ściany, krawędzie, wierzchołki, siatki i nazwy brył.
 *
 *   npx tsx scripts/rewriteBrylyTasks.ts
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type Spec = {
  content: string;
  correct: string;
  wrongs: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
};

const SPECS: Spec[] = [
  { content: "Ile ścian ma sześcian?", correct: "6", wrongs: ["8", "12", "4"], explanation: "Sześcian ma $6$ ścian, każda jest kwadratem.", difficulty: 1 },
  { content: "Ile krawędzi ma sześcian?", correct: "12", wrongs: ["6", "8", "10"], explanation: "Sześcian ma $12$ krawędzi: $4$ dolne, $4$ górne i $4$ pionowe.", difficulty: 1 },
  { content: "Ile wierzchołków ma sześcian?", correct: "8", wrongs: ["6", "12", "4"], explanation: "Sześcian ma $8$ wierzchołków: po $4$ w dolnej i górnej podstawie.", difficulty: 1 },
  { content: "Która bryła ma $6$ jednakowych kwadratowych ścian?", correct: "sześcian", wrongs: ["prostopadłościan", "ostrosłup czworokątny", "graniastosłup trójkątny"], explanation: "Sześcian to prostopadłościan, którego wszystkie $6$ ścian to przystające kwadraty.", difficulty: 1 },
  { content: "Która bryła ma jedną okrągłą podstawę i jeden wierzchołek?", correct: "stożek", wrongs: ["walec", "kula", "graniastosłup"], explanation: "Stożek ma okrągłą podstawę i wierzchołek, w którym schodzą się tworzące.", difficulty: 1 },
  { content: "Która bryła ma dwie równoległe okrągłe podstawy?", correct: "walec", wrongs: ["stożek", "kula", "ostrosłup"], explanation: "Walec ma dwie przystające, równoległe podstawy w kształcie kół.", difficulty: 1 },
  { content: "Ile ścian ma ostrosłup czworokątny?", correct: "5", wrongs: ["4", "6", "8"], explanation: "Ostrosłup czworokątny ma $1$ podstawę i $4$ ściany boczne, razem $5$ ścian.", difficulty: 2 },
  { content: "Ile krawędzi ma graniastosłup trójkątny?", correct: "9", wrongs: ["6", "12", "8"], explanation: "Graniastosłup trójkątny ma $3$ krawędzie w każdej podstawie i $3$ krawędzie boczne, razem $9$.", difficulty: 2 },
  { content: "Ile wierzchołków ma graniastosłup trójkątny?", correct: "6", wrongs: ["5", "8", "9"], explanation: "Graniastosłup trójkątny ma po $3$ wierzchołki w każdej podstawie, razem $6$.", difficulty: 2 },
  { content: "Która bryła nie ma ani wierzchołka, ani krawędzi?", correct: "kula", wrongs: ["walec", "stożek", "sześcian"], explanation: "Kula ma tylko powierzchnię zakrzywioną - nie ma wierzchołków ani krawędzi.", difficulty: 1 },
  { content: "Która siatka składa się z sześciu kwadratów?", correct: "sześcian", wrongs: ["prostopadłościan", "ostrosłup", "walec"], explanation: "Siatka sześcianu to $6$ jednakowych kwadratów.", difficulty: 1 },
  { content: "Ile ścian ma graniastosłup trójkątny?", correct: "5", wrongs: ["6", "4", "8"], explanation: "Graniastosłup trójkątny ma $2$ podstawy i $3$ ściany boczne, razem $5$ ścian.", difficulty: 2 },
  { content: "Ile krawędzi ma ostrosłup czworokątny?", correct: "8", wrongs: ["5", "6", "12"], explanation: "Ostrosłup czworokątny ma $4$ krawędzie podstawy i $4$ krawędzie boczne, razem $8$.", difficulty: 2 },
  { content: "Ile wierzchołków ma ostrosłup trójkątny?", correct: "4", wrongs: ["3", "5", "6"], explanation: "Ostrosłup trójkątny ma $3$ wierzchołki podstawy i $1$ wierzchołek główny, razem $4$.", difficulty: 2 },
  { content: "Która bryła ma wszystkie krawędzie równej długości?", correct: "sześcian", wrongs: ["prostopadłościan", "walec", "stożek"], explanation: "W sześcianie wszystkie $12$ krawędzi ma tę samą długość.", difficulty: 1 },
  { content: "Która bryła powstaje przez obrót prostokąta wokół jednego boku?", correct: "walec", wrongs: ["stożek", "kula", "sześcian"], explanation: "Obrót prostokąta wokół boku zakreśla walec.", difficulty: 2 },
  { content: "Która bryła powstaje przez obrót trójkąta prostokątnego wokół przyprostokątnej?", correct: "stożek", wrongs: ["walec", "kula", "ostrosłup"], explanation: "Obrót trójkąta prostokątnego wokół przyprostokątnej daje stożek.", difficulty: 2 },
  { content: "Ile ścian bocznych ma ostrosłup sześciokątny?", correct: "6", wrongs: ["5", "8", "12"], explanation: "Ostrosłup o podstawie $n$-kąta ma $n$ ścian bocznych, więc dla sześciokąta $6$.", difficulty: 2 },
  { content: "Ile wierzchołków ma prostopadłościan?", correct: "8", wrongs: ["6", "12", "4"], explanation: "Prostopadłościan ma $8$ wierzchołków: po $4$ w dolnej i górnej podstawie.", difficulty: 1 },
  { content: "Która bryła ma $4$ trójkątne ściany?", correct: "ostrosłup trójkątny", wrongs: ["ostrosłup czworokątny", "graniastosłup trójkątny", "sześcian"], explanation: "Ostrosłup trójkątny (czworościan) ma $4$ ściany, każda jest trójkątem.", difficulty: 3 },
];

function idFor(index: number): string {
  const hash = crypto
    .createHash("sha1")
    .update(`8_klasa|geometria_przestrzenna|bryly|${index}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const tasks = SPECS.map((spec, index) => {
  const options = [...new Set([spec.correct, ...spec.wrongs])].slice(0, 4);
  if (options.length !== 4) throw new Error(`Za mało opcji: ${spec.content}`);
  return {
    content: spec.content,
    correct_answer: spec.correct,
    options,
    answer_type: "choice",
    difficulty: spec.difficulty,
    xp_reward: 10 + spec.difficulty * 4,
    explanation: `${spec.explanation}\n**Odpowiedź:** ${spec.correct}`,
    figure_svg: null,
    figure_caption: null,
    id: idFor(index),
    generatedAt: new Date().toISOString(),
    model: "bryly-recognition-v1",
  };
});

const out = {
  exam_type: "8_klasa",
  category: "geometria_przestrzenna",
  topic: "bryly",
  categoryName: "Geometria przestrzenna",
  topicName: "Bryły - rozpoznawanie",
  tasks,
  updatedAt: new Date().toISOString(),
};

fs.writeFileSync(
  path.resolve(process.cwd(), "data/tasks-cache/8_klasa__geometria_przestrzenna__bryly.json"),
  `${JSON.stringify(out, null, 2)}\n`,
  "utf8",
);
console.log(`Zapisano ${tasks.length} zadań rozpoznawczych.`);
