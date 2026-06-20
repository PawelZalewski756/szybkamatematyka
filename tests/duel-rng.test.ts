import { describe, it, expect } from "vitest";
import {
  mulberry32,
  withSeededRandom,
  randomSeed,
  roomCodeFromSeed,
  seedFromRoomCode,
} from "@/lib/pojedynki/duel-rng";

function take(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => rng());
}

describe("mulberry32", () => {
  it("ten sam seed → identyczna sekwencja", () => {
    const a = take(mulberry32(12345), 10);
    const b = take(mulberry32(12345), 10);
    expect(a).toEqual(b);
  });

  it("różne seedy → różne sekwencje", () => {
    const a = take(mulberry32(1), 10);
    const b = take(mulberry32(2), 10);
    expect(a).not.toEqual(b);
  });

  it("zwraca wartości w przedziale [0, 1)", () => {
    const rng = mulberry32(98765);
    for (const v of take(rng, 1000)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("withSeededRandom", () => {
  it("jest deterministyczny dla tego samego seeda", () => {
    const seq = () => take(() => Math.random(), 5);
    const a = withSeededRandom(42, seq);
    const b = withSeededRandom(42, seq);
    expect(a).toEqual(b);
  });

  it("daje ten sam ciąg co bezpośrednie mulberry32(seed)", () => {
    const direct = take(mulberry32(7), 5);
    const viaHelper = withSeededRandom(7, () => take(() => Math.random(), 5));
    expect(viaHelper).toEqual(direct);
  });

  it("przywraca oryginalny Math.random po wywołaniu", () => {
    const original = Math.random;
    withSeededRandom(1, () => Math.random());
    expect(Math.random).toBe(original);
  });

  it("przywraca Math.random nawet gdy fn rzuci wyjątek", () => {
    const original = Math.random;
    expect(() =>
      withSeededRandom(1, () => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(Math.random).toBe(original);
  });

  it("zwraca wartość zwróconą przez fn", () => {
    expect(withSeededRandom(1, () => "wynik")).toBe("wynik");
  });
});

describe("randomSeed", () => {
  it("zwraca 32-bitową liczbę całkowitą bez znaku", () => {
    for (let i = 0; i < 100; i++) {
      const s = randomSeed();
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe("roomCodeFromSeed / seedFromRoomCode", () => {
  it("ten sam seed → ten sam kod pokoju (determinizm)", () => {
    expect(roomCodeFromSeed(123456)).toBe(roomCodeFromSeed(123456));
  });

  it("kod ma zadaną długość i tylko bezpieczne znaki", () => {
    const code = roomCodeFromSeed(99, 5);
    expect(code).toHaveLength(5);
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
    expect(roomCodeFromSeed(99, 8)).toHaveLength(8);
  });

  it("seedFromRoomCode jest deterministyczny i niewrażliwy na wielkość liter/spacje", () => {
    expect(seedFromRoomCode("ABCDE")).toBe(seedFromRoomCode("abcde"));
    expect(seedFromRoomCode("ABCDE")).toBe(seedFromRoomCode("  abcde  "));
    expect(seedFromRoomCode("ABCDE")).toBeGreaterThanOrEqual(0);
  });
});
