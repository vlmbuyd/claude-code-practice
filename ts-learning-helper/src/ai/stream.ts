import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function streamToTerminal(
  userMessage: string,
  systemPrompt: string,
  options: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const model = options.model ?? 'claude-sonnet-4-6';
  const maxTokens = options.maxTokens ?? 2048;

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  let fullText = '';

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      process.stdout.write(event.delta.text);
      fullText += event.delta.text;
    }
  }

  process.stdout.write('\n');
  return fullText;
}

export async function streamConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  options: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const model = options.model ?? 'claude-sonnet-4-6';
  const maxTokens = options.maxTokens ?? 2048;

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  let fullText = '';

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      process.stdout.write(event.delta.text);
      fullText += event.delta.text;
    }
  }

  process.stdout.write('\n');
  return fullText;
}
