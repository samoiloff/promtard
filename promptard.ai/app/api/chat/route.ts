import { resolveGroqModelId } from "@/lib/groq/models";
import { chatRequestSchema } from "@/lib/chat/validation";

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const groqModel = resolveGroqModelId(parsed.data.model);

  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        messages: parsed.data.messages,
        stream: true,
      }),
    },
  );

  if (!groqResponse.ok) {
    let message = "Groq request failed";
    try {
      const err = (await groqResponse.json()) as {
        error?: { message?: string };
      };
      if (err.error?.message) message = err.error.message;
    } catch {
      // ignore
    }
    return Response.json({ error: message }, { status: 502 });
  }

  if (!groqResponse.body) {
    return Response.json({ error: "Empty stream from Groq" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqResponse.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(
                  encoder.encode(JSON.stringify({ delta }) + "\n"),
                );
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
      } catch {
        controller.error(new Error("Stream interrupted"));
        return;
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
