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
      vi.fn(async () => new Response(TRIVIA, { status: 200 })),
    );
  });

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
      vi.fn(
        async () =>
          new Response("pop_culture:\n  beginner:\n    - question: Broken", {
            status: 200,
          }),
      ),
    );
    const database = new TriviaDatabase();
    await database.load();

    expect(database.getCategories()).toEqual([]);
    expect(database.getQuestion(GameMode.NORMAL).question).toBe(
      "What is 2 + 2?",
    );
  });
});
