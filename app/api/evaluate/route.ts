import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  EvaluationInputSchema,
  EvaluationResponseSchema,
} from "@/lib/schema";
import { checkGuardrails } from "@/lib/guardrails";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert roleplay evaluator. Analyze the provided roleplay session and return ONLY a valid JSON object with the exact structure specified. Do not include any explanations, markdown, or additional text.

Return a JSON object with this EXACT structure:
{
  "overallScore": 0-100,
  "scores": {
    "communication": 0-100,
    "empathy": 0-100,
    "productKnowledge": 0-100
  },
  "summary": "Brief evaluation summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "riskFlags": [
    {
      "type": "toxicity" | "policy" | "safety" | "none",
      "description": "Description of the flag or 'No risks detected'"
    }
  ]
}

Ensure all scores are numbers between 0-100. Provide at least 3 strengths and 3 improvements. If no risks are detected, use type "none" with appropriate description.`;

const evaluationObjectSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: z.object({
    communication: z.number().min(0).max(100),
    empathy: z.number().min(0).max(100),
    productKnowledge: z.number().min(0).max(100),
  }),
  summary: z.string(),
  strengths: z.array(z.string()).min(3),
  improvements: z.array(z.string()).min(3),
  riskFlags: z.array(
    z.object({
      type: z.enum(["toxicity", "policy", "safety", "none"]),
      description: z.string(),
    })
  ),
});

function extractJSON(content: string): any {
  if (!content || !content.trim()) {
    throw new Error("Empty response from model");
  }

  let cleanedContent = content.trim();

  // Remove markdown code blocks (handle various formats)
  cleanedContent = cleanedContent.replace(/^```json\s*/i, "");
  cleanedContent = cleanedContent.replace(/^```\s*/i, "");
  cleanedContent = cleanedContent.replace(/```\s*$/i, "");
  cleanedContent = cleanedContent.trim();

  // Try to find JSON object in the content
  // Look for the first { and last } to extract JSON
  const firstBrace = cleanedContent.indexOf("{");
  const lastBrace = cleanedContent.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error("No JSON object found in response");
  }

  cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(cleanedContent);
  } catch (parseError) {
    // Log the problematic content for debugging (first 500 chars)
    console.error("JSON parse error. Content:", cleanedContent.substring(0, 500));
    throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
  }
}

async function callGroqWithRetry(
  scenario: string,
  transcript: string,
  isRetry = false
): Promise<any> {
  const userPrompt = isRetry
    ? `CORRECTION: Your previous response was not valid JSON. Please respond with ONLY a valid JSON object, no markdown, no explanations, no text before or after the JSON. Start directly with { and end with }.

Scenario: ${scenario}

Transcript: ${transcript}`
    : `Scenario: ${scenario}

Transcript: ${transcript}`;

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const parsed = extractJSON(text);
    
    // Validate against schema
    const validated = evaluationObjectSchema.parse(parsed);
    return validated;
  } catch (error: any) {
    console.error("Groq API error:", error);
    console.error("Error details:", {
      message: error?.message,
      cause: error?.cause,
      name: error?.name,
    });
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: {
            code: "CONFIGURATION_ERROR",
            message: "GROQ_API_KEY is not configured.",
          },
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    const validatedInput = EvaluationInputSchema.parse(body);
    const { userId, scenario, transcript } = validatedInput;

    const combinedText = `${scenario} ${transcript}`;
    if (checkGuardrails(combinedText)) {
      return NextResponse.json(
        {
          error: {
            code: "GUARDRAIL_BLOCKED",
            message: "The submitted content violates allowed policy rules.",
          },
        },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();
    let response;

    try {
      response = await callGroqWithRetry(scenario, transcript, false);
    } catch (firstError: any) {
      console.error("First attempt failed:", firstError?.message || firstError);
      try {
        response = await callGroqWithRetry(scenario, transcript, true);
      } catch (secondError: any) {
        console.error("Retry attempt failed:", secondError?.message || secondError);
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_FAILED",
              message: secondError?.message || "Failed to get valid response from the model after retry.",
            },
          },
          { status: 500 }
        );
      }
    }

    const finalResponse = {
      sessionId,
      userId: userId || null,
      ...response,
      createdAt: new Date().toISOString(),
    };

    const validatedResponse = EvaluationResponseSchema.parse(finalResponse);

    return NextResponse.json(validatedResponse);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_INPUT",
            message: "Invalid input data.",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 }
    );
  }
}