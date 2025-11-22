import { z } from "zod";

export const EvaluationInputSchema = z.object({
  userId: z.string().nullable().optional(),
  scenario: z.string().min(1, "Scenario is required"),
  transcript: z.string().min(1, "Transcript is required"),
});

export const RiskFlagSchema = z.object({
  type: z.enum(["toxicity", "policy", "safety", "none"]),
  description: z.string(),
});

export const EvaluationResponseSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().nullable(),
  overallScore: z.number().min(0).max(100),
  scores: z.object({
    communication: z.number().min(0).max(100),
    empathy: z.number().min(0).max(100),
    productKnowledge: z.number().min(0).max(100),
  }),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  riskFlags: z.array(RiskFlagSchema),
  createdAt: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type EvaluationInput = z.infer<typeof EvaluationInputSchema>;
export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;
export type RiskFlag = z.infer<typeof RiskFlagSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
