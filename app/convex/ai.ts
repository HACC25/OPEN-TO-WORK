import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateObject, jsonSchema } from 'ai';

export const getAIGeneratedReportFields = action({
    args: {
        content: v.string(),
    },
    handler: async (_ctx, args) => {
        const result = await generateObject({
            model: openai('gpt-4.1-mini'),
            messages: [
                {
                    role: 'system' as const,
                    content: `Based on the content of the IV&V report provided, fill in the fields.

IMPORTANT: For findings, the findingType field MUST be exactly one of: 'Risk' or 'Issue'. 
- Use 'Risk' for potential future problems or concerns
- Use 'Issue' for current problems that have already occurred
- Do NOT use any other values like 'Preliminary Concern', 'Observation', or any other terms. Only 'Risk' or 'Issue' are allowed.`,
                },
                {
                    role: 'user' as const,
                    content: [
                        {
                            type: 'text' as const,
                            text: args.content,
                        },
                    ],
                },
            ],
            schema: jsonSchema<{
                currentStatus: 'On Track' | 'Minor Issues' | 'Critical';
                teamPerformance?: 'On Track' | 'Minor Issues' | 'Critical';
                projectManagement?: 'On Track' | 'Minor Issues' | 'Critical';
                technicalReadiness?: 'On Track' | 'Minor Issues' | 'Critical';
                summary: string;
                accomplishments?: string;
                challenges?: string;
                upcomingMilestones?: string;
                budgetStatus?: string;
                scheduleStatus?: string;
                riskSummary?: string;
                findings: {
                    findingNumber: string;
                    findingType: 'Risk' | 'Issue';
                    description: string;
                    impactRating: 'Low' | 'Medium' | 'High';
                    likelihoodRating: 'Low' | 'Medium' | 'High';
                    recommendation: string;
                    status: 'Open' | 'In Progress' | 'Closed';
                }[];
            }>({
                type: 'object',
                properties: {
                    currentStatus: {
                        type: 'string',
                        enum: ['On Track', 'Minor Issues', 'Critical'],
                    },
                    teamPerformance: {
                        type: 'string',
                        enum: ['On Track', 'Minor Issues', 'Critical'],
                    },
                    projectManagement: {
                        type: 'string',
                        enum: ['On Track', 'Minor Issues', 'Critical'],
                    },
                    technicalReadiness: {
                        type: 'string',
                        enum: ['On Track', 'Minor Issues', 'Critical'],
                    },
                    summary: {
                        type: 'string',
                    },
                    accomplishments: {
                        type: 'string',
                    },
                    challenges: {
                        type: 'string',
                    },
                    upcomingMilestones: {
                        type: 'string',
                    },
                    budgetStatus: {
                        type: 'string',
                    },
                    scheduleStatus: {
                        type: 'string',
                    },
                    riskSummary: {
                        type: 'string',
                    },
                    findings: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                findingNumber: {
                                    type: 'string',
                                },
                                findingType: {
                                    type: 'string',
                                    enum: ['Risk', 'Issue'],
                                },
                                description: {
                                    type: 'string',
                                },
                                impactRating: {
                                    type: 'string',
                                    enum: ['Low', 'Medium', 'High'],
                                },
                                likelihoodRating: {
                                    type: 'string',
                                    enum: ['Low', 'Medium', 'High'],
                                },
                                recommendation: {
                                    type: 'string',
                                },
                                status: {
                                    type: 'string',
                                    enum: ['Open', 'In Progress', 'Closed'],
                                },
                            },
                            required: ['findingNumber', 'findingType', 'description', 'impactRating', 'likelihoodRating', 'recommendation', 'status'],
                        },
                    },
                },
                required: ['currentStatus', 'summary', 'findings'],
            }),
        });
        return result.object;
    },
});
