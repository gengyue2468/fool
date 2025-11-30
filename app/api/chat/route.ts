import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getPromptContent, type ModelId, type PromptTemplateId } from "@/config/ai.config";

const openai = new OpenAI({
  baseURL: "https://api.ppinfra.com/openai",
  apiKey: process.env.PPIO_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { messages, model, promptTemplate, customPrompt } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    model?: ModelId;
    promptTemplate?: PromptTemplateId;
    customPrompt?: string;
  };

  const selectedModel = model || "deepseek/deepseek-v3.2-exp";
  const selectedTemplate = promptTemplate || "silly";
  const systemPrompt = getPromptContent(selectedTemplate, customPrompt);

  const mergedMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const completion = await openai.chat.completions.create({
    model: selectedModel,
    messages: mergedMessages,
    stream: true,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
