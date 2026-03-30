import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 시작 시점에 API 키 존재 여부 확인
if (!process.env.OPENAI_API_KEY) {
  console.error(
    "[ERROR] OPENAI_API_KEY가 설정되지 않았습니다.\n" +
      "  .env 파일에 OPENAI_API_KEY=your_api_key_here 를 추가하거나\n" +
      "  export OPENAI_API_KEY=... 로 환경변수를 설정하세요."
  );
  process.exit(1);
}

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.post("/api/generate", async (req, res) => {
  const { context, type, convention, language } = req.body;

  if (!context || !type) {
    return res.status(400).json({ error: "context와 type은 필수입니다." });
  }

  const systemPrompt = `당신은 개발자를 위한 네이밍 전문가입니다.
사용자가 제공하는 맥락을 바탕으로 변수명, 함수명, 클래스명 등을 생성합니다.

규칙:
- 반드시 한국어로 설명하고, 네이밍 자체는 영어로 작성
- 5~8개의 다양한 후보를 제시
- 각 후보에 대해 짧은 설명 추가
- 네이밍 컨벤션을 정확히 따를 것
- 실용적이고 의미가 명확한 이름 우선
- JSON 형식으로 응답: { "candidates": [{ "name": "...", "description": "..." }] }`;

  const userPrompt = `다음 맥락에 맞는 ${type} 이름을 생성해주세요.

프로그래밍 언어: ${language || "언어 무관"}
네이밍 컨벤션: ${convention || "camelCase"}
유형: ${type}

맥락:
${context}

위 맥락을 분석하여 최적의 ${type} 이름 5~8개를 JSON 형식으로 제안해주세요.`;

  // SSE 헤더는 실제 스트리밍 직전에 설정
  try {
    const stream = client.chat.completions.stream({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    // API 호출이 성공적으로 시작된 후에 SSE 헤더 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const event of stream) {
      const text = event.choices[0]?.delta?.content;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("[API ERROR]", error.message);

    const message =
      error.status === 401
        ? "API 키가 유효하지 않습니다. .env 파일의 OPENAI_API_KEY를 확인하세요."
        : error.status === 429
        ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        : error.status === 400 && error.message?.includes("credit")
        ? "OpenAI 크레딧이 부족합니다. platform.openai.com에서 충전해주세요."
        : `OpenAI API 오류: ${error.message}`;

    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
