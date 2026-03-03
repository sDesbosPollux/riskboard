export type EmploymentType = "CDI" | "CDD" | "FREELANCE";

export interface LoanApplicationInput {
  incomeMonthly: number;
  expensesMonthly: number;
  requestedAmount: number;
  existingDebt: number;
  employmentType: EmploymentType;
  age: number;
}

export type Decision = "ACCEPT" | "REVIEW" | "REJECT";

export interface ScoreResult {
  score: number;
  decision: Decision;
  reasons: string[];
}

export function computeScore(input: LoanApplicationInput): ScoreResult {
  let score = 100;
  const reasons: string[] = [];

  // Debt ratio rule
  const ratio =
    (input.existingDebt + input.requestedAmount) / (input.incomeMonthly * 12);
  if (ratio > 0.5) {
    score -= 40;
    reasons.push("Debt ratio exceeds 50% of annual income (-40)");
  } else if (ratio > 0.35) {
    score -= 20;
    reasons.push("Debt ratio exceeds 35% of annual income (-20)");
  }

  // Disposable income rule
  const disposable = input.incomeMonthly - input.expensesMonthly;
  if (disposable < 500) {
    score -= 30;
    reasons.push("Disposable income below 500 (-30)");
  } else if (disposable < 1000) {
    score -= 10;
    reasons.push("Disposable income below 1000 (-10)");
  }

  // Employment type rule
  if (input.employmentType === "CDD") {
    score -= 10;
    reasons.push("Employment type CDD (-10)");
  } else if (input.employmentType === "FREELANCE") {
    score -= 20;
    reasons.push("Employment type FREELANCE (-20)");
  }

  // Age rule
  if (input.age < 21) {
    score -= 15;
    reasons.push("Age below 21 (-15)");
  } else if (input.age >= 65) {
    score -= 10;
    reasons.push("Age 65 or above (-10)");
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Decision
  let decision: Decision;
  if (score >= 70) {
    decision = "ACCEPT";
  } else if (score >= 50) {
    decision = "REVIEW";
  } else {
    decision = "REJECT";
  }

  return { score, decision, reasons };
}
