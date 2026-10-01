import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameMode, ProgrammingLanguage } from "../../src/types";
import { TriviaDatabase } from "../../src/utils/triviaDatabase";

const TRIVIA = `
pop_culture:
  beginner:
    - question: Which answer is correct?
      options: [Wrong, Right, Also wrong]
      correct: 1
javascript:
  beginner:
    - question: Which keyword declares a constant?
      options: [let, var, const]
      correct: 2
`;

describe("trivia database", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(TRIVIA, { status: 200 }))),
    );
  });

  it.each(["{}", "pop_culture: { beginner: [] }"])(
    "rejects empty question datasets: %s",
    async (content) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(new Response(content))),
      );
      const database = new TriviaDatabase();
      await expect(database.load()).rejects.toThrow("at least one question");
      expect(database.isLoaded()).toBe(false);
    },
  );

  it("loads validated YAML and returns a general question", async () => {
    const database = new TriviaDatabase();
    await database.load();

    expect(database.isLoaded()).toBe(true);
    expect(database.getCategories()).toEqual(["pop_culture", "javascript"]);
    expect(database.getQuestion(GameMode.NORMAL)).toMatchObject({
      question: "Which answer is correct?",
      correctAnswer: 1,
      difficulty: "beginner",
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("maps programming languages to their matching category", async () => {
    const database = new TriviaDatabase();
    await database.load();

    const question = database.getQuestion(
      GameMode.PROGRAMMING,
      ProgrammingLanguage.JAVASCRIPT,
    );
    expect(question.category).toBe("javascript");
    expect(question.correctAnswer).toBe(2);
  });

  it("returns a known fallback when a category is unavailable", async () => {
    const database = new TriviaDatabase();
    await database.load();

    const question = database.getQuestion(
      GameMode.PROGRAMMING,
      ProgrammingLanguage.PYTHON,
    );
    expect(question.question).toBe("What is 2 + 2?");
  });

  it("returns a complete bonus item", () => {
    const bonus = new TriviaDatabase().getBonusItem();
    expect(bonus).toMatchObject({
      itemId: 0,
      name: "Seeking Missiles",
      uses: 1,
    });
  });

  it("rejects invalid question records without leaking bad data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response("pop_culture:\n  beginner:\n    - question: Broken", {
            status: 200,
          }),
        ),
      ),
    );
    const database = new TriviaDatabase();
    await expect(database.load()).rejects.toThrow("Invalid trivia question");

    expect(database.isLoaded()).toBe(false);
    expect(database.getCategories()).toEqual([]);
    expect(database.getQuestion(GameMode.NORMAL).question).toBe(
      "What is 2 + 2?",
    );
  });

  it("retries failed loads and shares concurrent requests", async () => {
    const fetchData = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("Temporary network failure"))
      .mockResolvedValue(new Response(TRIVIA));
    vi.stubGlobal("fetch", fetchData);
    const database = new TriviaDatabase();

    const failures = await Promise.allSettled([
      database.load(),
      database.load(),
    ]);
    expect(failures.map((result) => result.status)).toEqual([
      "rejected",
      "rejected",
    ]);
    expect(fetchData).toHaveBeenCalledOnce();
    expect(database.isLoaded()).toBe(false);

    await Promise.all([database.load(), database.load()]);
    expect(fetchData).toHaveBeenCalledTimes(2);
    expect(database.isLoaded()).toBe(true);
    expect(database.getQuestion(GameMode.NORMAL).correctAnswer).toBe(1);
  });

  it("retries a synchronous transport failure", async () => {
    const fetchData = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(() => {
        throw new Error("Transport unavailable");
      })
      .mockResolvedValue(new Response(TRIVIA));
    vi.stubGlobal("fetch", fetchData);
    const database = new TriviaDatabase();
    await expect(database.load()).rejects.toThrow("Transport unavailable");
    await database.load();
    expect(fetchData).toHaveBeenCalledTimes(2);
    expect(database.getCategories()).toEqual(["pop_culture", "javascript"]);
  });

  it.each([
    "question: ''\n      options: [Yes, No]\n      correct: 0",
    "question: Valid?\n      options: []\n      correct: 0",
    "question: Valid?\n      options: [Only]\n      correct: 0",
    "question: Valid?\n      options: ['', No]\n      correct: 0",
    "question: Valid?\n      options: [Yes, No]\n      correct: 2",
  ])("rejects malformed question content: %s", async (question) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(`pop_culture:\n  beginner:\n    - ${question}`),
        ),
      ),
    );
    const database = new TriviaDatabase();
    await expect(database.load()).rejects.toThrow("Invalid trivia question");
    expect(database.isLoaded()).toBe(false);
  });
});
