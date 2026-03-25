const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getGeminiApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Missing VITE_GEMINI_API_KEY in .env");
  return key;
}

async function fetchPageMetadata(url: string): Promise<{ title: string; description: string }> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? "";

    const descMatch =
      html.match(/<meta[^>]+(?:name=["']description["']|property=["']og:description["'])[^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name=["']description["']|property=["']og:description["'])/i);
    const description = descMatch?.[1]?.trim() ?? "";

    return { title, description };
  } catch {
    return { title: "", description: "" };
  }
}

export async function suggestTagsForUrl(url: string): Promise<string[]> {
  const apiKey = getGeminiApiKey();
  const { title, description } = await fetchPageMetadata(url);

  const contextParts = [
    `URL: ${url}`,
    title ? `Page title: ${title}` : "",
    description ? `Description: ${description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `Based on the following web resource, suggest exactly 3 short, lowercase tags (1-2 words each) that best categorize it for a personal resource library.\n\n${contextParts}\n\nReturn ONLY a JSON array of 3 strings, nothing else. Example: ["design", "ui components", "accessibility"]`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data: unknown = await response.json();
  const text: string =
    (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const tags: unknown = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(tags)) return [];

  return tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim().toLowerCase())
    .slice(0, 3);
}
