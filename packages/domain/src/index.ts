// Domain exports — business entities and interfaces will be added here
export const DOMAIN_OK = true as const;

export type { EmploymentType, LoanApplicationInput, Decision, ScoreResult } from "./scoring.js";
export { computeScore } from "./scoring.js";
