import { describe, it, expect } from "vitest";
import { computeScore } from "./scoring.js";
import type { LoanApplicationInput } from "./scoring.js";

const base: LoanApplicationInput = {
  incomeMonthly: 3000,
  expensesMonthly: 1500,
  requestedAmount: 10000,
  existingDebt: 2000,
  employmentType: "CDI",
  age: 30,
};

describe("computeScore", () => {
  it("returns ACCEPT for an ideal applicant (score = 100)", () => {
    // ratio = (0 + 0) / (3000 * 12) = 0, disposable = 3000 - 1000 = 2000, CDI, age 30
    const result = computeScore({
      incomeMonthly: 3000,
      expensesMonthly: 1000,
      requestedAmount: 0,
      existingDebt: 0,
      employmentType: "CDI",
      age: 30,
    });
    expect(result.score).toBe(100);
    expect(result.decision).toBe("ACCEPT");
    expect(result.reasons).toHaveLength(0);
  });

  it("applies -40 when debt ratio > 0.5", () => {
    // ratio = (0 + 19000) / (3000 * 12) = 19000/36000 ≈ 0.527
    const result = computeScore({ ...base, requestedAmount: 19000, existingDebt: 0 });
    expect(result.reasons.some((r) => r.includes("-40"))).toBe(true);
    expect(result.score).toBe(100 - 40); // disposable = 1500 (>= 1000), no disposable penalty
  });

  it("applies -20 when debt ratio is between 0.35 and 0.5", () => {
    // ratio = (0 + 13000) / (3000 * 12) = 13000/36000 ≈ 0.361
    const result = computeScore({ ...base, requestedAmount: 13000, existingDebt: 0 });
    expect(result.reasons.some((r) => r.includes("-20"))).toBe(true);
    expect(result.score).toBe(100 - 20); // disposable = 1500 (>= 1000), no disposable penalty
  });

  it("does not penalise ratio when ratio = 0.35 exactly (boundary)", () => {
    // ratio = 0.35 exactly => no ratio penalty
    const income = 1000;
    const amount = income * 12 * 0.35; // = 4200
    const result = computeScore({
      ...base,
      incomeMonthly: income,
      expensesMonthly: 0,
      requestedAmount: amount,
      existingDebt: 0,
    });
    expect(result.reasons.some((r) => r.includes("Debt ratio"))).toBe(false);
  });

  it("applies -30 when disposable income < 500", () => {
    const result = computeScore({ ...base, expensesMonthly: 2700 }); // disposable = 300
    expect(result.reasons.some((r) => r.includes("-30"))).toBe(true);
  });

  it("applies -10 when disposable income is between 500 and 1000 (boundary at 999)", () => {
    const result = computeScore({ ...base, expensesMonthly: 2001 }); // disposable = 999
    expect(result.reasons.some((r) => r.includes("below 1000"))).toBe(true);
  });

  it("does not penalise disposable when it equals 1000 exactly (boundary)", () => {
    const result = computeScore({ ...base, expensesMonthly: 2000 }); // disposable = 1000
    expect(result.reasons.some((r) => r.includes("Disposable"))).toBe(false);
  });

  it("applies -10 for CDD employment type", () => {
    const result = computeScore({ ...base, employmentType: "CDD" });
    expect(result.reasons.some((r) => r.includes("CDD"))).toBe(true);
    expect(result.score).toBe(100 - 10); // ratio = 12000/36000 = 0.333 (no ratio penalty), CDD -10
  });

  it("applies -20 for FREELANCE employment type", () => {
    const result = computeScore({ ...base, employmentType: "FREELANCE" });
    expect(result.reasons.some((r) => r.includes("FREELANCE"))).toBe(true);
  });

  it("applies -15 for age < 21", () => {
    const result = computeScore({ ...base, age: 20 });
    expect(result.reasons.some((r) => r.includes("Age below 21"))).toBe(true);
  });

  it("does not penalise age of exactly 21 (boundary)", () => {
    const result = computeScore({ ...base, age: 21 });
    expect(result.reasons.some((r) => r.includes("Age"))).toBe(false);
  });

  it("does not penalise age of exactly 65 (boundary)", () => {
    const result = computeScore({ ...base, age: 65 });
    expect(result.reasons.some((r) => r.includes("Age"))).toBe(false);
  });

  it("applies -10 for age > 65", () => {
    const result = computeScore({ ...base, age: 66 });
    expect(result.reasons.some((r) => r.includes("Age above 65"))).toBe(true);
  });

  it("returns REVIEW when score is between 50 and 69", () => {
    // -40 ratio, -10 disposable => 50
    const result = computeScore({
      incomeMonthly: 1000,
      expensesMonthly: 500, // disposable = 500, triggers <1000 rule => -10
      requestedAmount: 7000, // ratio = 7000/12000 ≈ 0.583 => -40
      existingDebt: 0,
      employmentType: "CDI",
      age: 30,
    });
    expect(result.score).toBe(50);
    expect(result.decision).toBe("REVIEW");
  });

  it("returns REJECT when score falls below 50", () => {
    // worst case: ratio > 0.5 (-40), disposable < 500 (-30), FREELANCE (-20), age < 21 (-15)
    const result = computeScore({
      incomeMonthly: 1000,
      expensesMonthly: 800, // disposable = 200 < 500 => -30
      requestedAmount: 7000, // ratio = 7000/12000 > 0.5 => -40
      existingDebt: 0,
      employmentType: "FREELANCE", // -20
      age: 18, // -15
    });
    expect(result.score).toBe(0); // clamped: 100 -40 -30 -20 -15 = -5 => 0
    expect(result.decision).toBe("REJECT");
  });

  it("score is clamped to 0 and never goes negative", () => {
    const result = computeScore({
      incomeMonthly: 500,
      expensesMonthly: 490, // disposable = 10 < 500 => -30
      requestedAmount: 5000, // ratio = 5000/6000 > 0.5 => -40
      existingDebt: 0,
      employmentType: "FREELANCE", // -20
      age: 18, // -15
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("returns REJECT with 'Invalid income' when incomeMonthly is zero", () => {
    const result = computeScore({ ...base, incomeMonthly: 0 });
    expect(result.score).toBe(0);
    expect(result.decision).toBe("REJECT");
    expect(result.reasons).toContain("Invalid income");
  });

  it("returns REJECT with 'Invalid income' when incomeMonthly is negative", () => {
    const result = computeScore({ ...base, incomeMonthly: -500 });
    expect(result.score).toBe(0);
    expect(result.decision).toBe("REJECT");
    expect(result.reasons).toContain("Invalid income");
  });

  it("score is clamped to 100 and never exceeds 100 for perfect applicant", () => {
    const result = computeScore({
      incomeMonthly: 10000,
      expensesMonthly: 0,
      requestedAmount: 0,
      existingDebt: 0,
      employmentType: "CDI",
      age: 40,
    });
    expect(result.score).toBe(100);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
