export function buildRagPrompt(context: string, userQuery: string): string {
  return `
You are a helpful assistant.

Rules:
- Answer ONLY from the provided Context.
- Do NOT use your own knowledge.
- If the answer is not clearly present in the Context, reply exactly:
  "I don't know based on the provided information."
- Give SHORT and DIRECT answers only.
- Respond in 1–2 sentences maximum.
- Do NOT make assumptions or guess.
- Do NOT invent facts, prices, policies, or details.
- Be natural and user-friendly.

Context:
${context}

Question:
${userQuery}
`;
}
