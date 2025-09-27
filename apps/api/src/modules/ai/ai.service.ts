import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly modelCandidates = [
    // Fast, low-cost community models
    'meta-llama/llama-3.1-8b-instruct',
    'mistralai/mistral-7b-instruct',
  ];

  constructor() {}

  async generateTaskDescription(
    taskTitle: string,
    boardTitle?: string,
    boardSubtitle?: string,
  ): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('AI_MISSING_API_KEY');
    }

    // Always respond in Vietnamese
    const languageInstruction = 'Write the entire output in Vietnamese.';

    const boardCtx = [
      boardTitle ? `Board: "${boardTitle}"` : '',
      boardSubtitle ? `Board subtitle: "${boardSubtitle}"` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const prompt = `You are an assistant that writes concise, actionable task descriptions for a project management tool.
Title: "${taskTitle}"
${boardCtx ? boardCtx + '\n' : ''}
${languageInstruction}
Format strictly with short bullet points and section labels. Do not add any preface or closing sentences. Keep total under 160 words.

Output template:
- Objective:
  - <one sentence>
- Key steps / deliverables:
  - <3-6 bullets>
- Acceptance criteria:
  - <2-4 bullets>`;

    for (const model of this.modelCandidates) {
      try {
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.5,
            max_tokens: 220,
          }),
        });

        const textBody = await res.text();
        if (!res.ok) {
          if (res.status === 401) throw new Error('AI_INVALID_API_KEY');
          if (res.status === 429) throw new Error('AI_QUOTA_EXCEEDED');
          // Try next model on 404/5xx
          if (res.status === 404 || res.status >= 500) continue;
          throw new Error(`AI_HTTP_${res.status}: ${textBody}`);
        }

        let data: any;
        try {
          data = JSON.parse(textBody);
        } catch {
          data = textBody;
        }

        const content: string =
          data?.choices?.[0]?.message?.content ||
          data?.choices?.[0]?.text ||
          '';

        if (content && content.trim().length > 0) {
          return content.trim();
        }
        // Empty output → try next model
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg === 'AI_INVALID_API_KEY' || msg === 'AI_QUOTA_EXCEEDED') {
          throw err;
        }
        // Try next model for other failures
        continue;
      }
    }

    throw new Error('AI_GENERATION_FAILED');
  }
}
