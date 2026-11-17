import { describe, expect, it } from "vitest";
import { POST as postCatalog } from "@/app/api/powtorki/catalog/route";
import { POST as postTasks } from "@/app/api/powtorki/tasks/route";

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

type TaskPayload = {
  id: string;
  title: string;
  hasSolution: boolean;
  solutionSteps?: unknown;
};

async function readTasks(response: Response): Promise<TaskPayload[]> {
  const data = (await response.json()) as { tasks: TaskPayload[] };
  return data.tasks;
}

describe("POST /api/powtorki/tasks", () => {
  it("zwraca zadania bez solutionSteps i oznacza dostępność rozwiązania", async () => {
    const response = await postTasks(
      jsonRequest("http://localhost/api/powtorki/tasks", {
        ids: ["st-001", "cke-m15-maj-z01", "nie-ma-takiego"],
      }),
    );

    expect(response.status).toBe(200);
    const tasks = await readTasks(response);
    expect(tasks.map((task) => task.id)).toEqual(["st-001", "cke-m15-maj-z01"]);
    expect(tasks[0]?.hasSolution).toBe(false);
    expect(tasks[1]?.hasSolution).toBe(true);
    for (const task of tasks) {
      expect(task.solutionSteps).toBeUndefined();
      expect("solutionSteps" in task).toBe(false);
    }
  });

  it("odrzuca puste i zbyt duże listy ID", async () => {
    const empty = await postTasks(
      jsonRequest("http://localhost/api/powtorki/tasks", { ids: [] }),
    );
    expect(empty.status).toBe(400);

    const tooMany = await postTasks(
      jsonRequest("http://localhost/api/powtorki/tasks", {
        ids: Array.from({ length: 201 }, (_, index) => `id-${index}`),
      }),
    );
    expect(tooMany.status).toBe(400);
  });

  it("odrzuca nieprawidłowy JSON", async () => {
    const response = await postTasks(
      new Request("http://localhost/api/powtorki/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
  });
});

describe("POST /api/powtorki/catalog", () => {
  it("wyszukuje zadania po treści i nie wysyła rozwiązań", async () => {
    const response = await postCatalog(
      jsonRequest("http://localhost/api/powtorki/catalog", {
        path: "sp",
        search: "procent",
      }),
    );

    expect(response.status).toBe(200);
    const tasks = await readTasks(response);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.length).toBeLessThanOrEqual(40);
    for (const task of tasks) {
      expect("solutionSteps" in task).toBe(false);
    }
  });

  it("podpowiada zadania już rozwiązane w podanej kolejności", async () => {
    const response = await postCatalog(
      jsonRequest("http://localhost/api/powtorki/catalog", {
        path: "sp",
        solvedIds: ["st-002", "st-001", "nie-ma-takiego"],
      }),
    );

    const tasks = await readTasks(response);
    expect(tasks.map((task) => task.id)).toEqual(["st-002", "st-001"]);
  });

  it("bez wyszukiwania i rozwiązań zwraca pulę dla ścieżki", async () => {
    const response = await postCatalog(
      jsonRequest("http://localhost/api/powtorki/catalog", { path: "srednia" }),
    );

    const tasks = await readTasks(response);
    expect(tasks.length).toBe(40);
  });
});
