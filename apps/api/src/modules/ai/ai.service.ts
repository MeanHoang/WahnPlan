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
    taskNotes?: string,
  ): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('AI_MISSING_API_KEY');
    }

    // Always respond in Vietnamese
    const languageInstruction = 'Write the entire output in Vietnamese.';

    const extra = [
      taskNotes ? `Ghi chú nhiệm vụ: "${taskNotes}"` : '',
      boardTitle ? `Tên board: "${boardTitle}"` : '',
      boardSubtitle ? `Mô tả board: "${boardSubtitle}"` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const prompt = `Bạn là trợ lý chuyên viết mô tả nhiệm vụ chi tiết cho công cụ quản lý dự án.

NHIỆM VỤ CHÍNH: Viết mô tả chi tiết cho nhiệm vụ có tên "${taskTitle}"

${extra ? `THÔNG TIN BỔ SUNG:\n${extra}\n` : ''}

YÊU CẦU QUAN TRỌNG:
- Phân tích kỹ tên nhiệm vụ "${taskTitle}" và hiểu rõ ý nghĩa cụ thể
- Viết mô tả CHÍNH XÁC cho nhiệm vụ này, không dùng mô tả chung chung
- Mỗi bước thực hiện phải liên quan TRỰC TIẾP đến "${taskTitle}"
- Tránh các mô tả mơ hồ như "xác định nhiệm vụ", "lập kế hoạch" chung chung
- Tập trung vào các hành động CỤ THỂ để hoàn thành "${taskTitle}"

${languageInstruction}

Định dạng đầu ra theo mẫu sau (không thêm phần mở đầu/kết thúc, tổng dưới 160 từ):

- Mục tiêu:
  - <một câu mô tả mục tiêu CỤ THỂ của "${taskTitle}">
- Bước thực hiện / sản phẩm đầu ra:
  - <3-6 gạch đầu dòng CỤ THỂ, đo được, chỉ liên quan đến "${taskTitle}">
- Điều kiện chấp nhận:
  - <2-4 gạch đầu dòng, rõ tiêu chí hoàn thành "${taskTitle}">

VÍ DỤ: Nếu tên nhiệm vụ là "Thiết kế giao diện đăng nhập", thì mô tả phải về thiết kế giao diện đăng nhập, không phải về "xác định nhiệm vụ" chung chung.`;

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
            temperature: 0.4,
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
