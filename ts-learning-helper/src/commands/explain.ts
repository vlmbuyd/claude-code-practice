import { Command } from 'commander';
import { confirm, input, editor } from '@inquirer/prompts';
import chalk from 'chalk';
import { streamToTerminal, streamConversation } from '../ai/stream.js';
import { explainStandardPrompt, explainFeynmanPrompt } from '../prompts/explain.js';
import { addInsight } from '../storage/index.js';
import { printHeader, printSection } from '../utils/display.js';

export function registerExplain(program: Command): void {
  program
    .command('explain <topic>')
    .description('TypeScript 개념을 설명받습니다. --feynman으로 파인만 기법 사용 (전략 3, 4)')
    .option('-f, --feynman', 'Feynman Technique (P→F→S→R) 4단계 학습 모드')
    .option('-c, --chapter <n>', '관련 챕터 번호')
    .action(async (topic: string, options: { feynman?: boolean; chapter?: string }) => {
      const label = options.feynman ? `${topic} (파인만 기법)` : topic;
      printHeader(`개념 설명: ${label}`);

      const chapterNote = options.chapter ? ` (챕터 ${options.chapter} 관련)` : '';
      const userMessage = `"${topic}"${chapterNote}에 대해 설명해주세요.`;

      if (!options.feynman) {
        const fullText = await streamToTerminal(userMessage, explainStandardPrompt);
        await offerInsightSave(fullText, options.chapter);
        return;
      }

      // Feynman 모드: 대화형 4단계
      printSection('P → F → S 단계 설명 중...');
      const initialResponse = await streamToTerminal(userMessage, explainFeynmanPrompt);

      console.log('');
      printSection('R (Review) - 이제 직접 설명해보세요');
      console.log(chalk.gray('본인의 말로 이 개념을 설명해보세요. 완벽하지 않아도 됩니다.'));

      const userExplanation = await editor({
        message: '본인의 설명:',
      });

      if (!userExplanation.trim()) {
        console.log(chalk.yellow('설명을 입력하지 않았습니다. 다음에 다시 시도해보세요.'));
        return;
      }

      printSection('피드백');
      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: initialResponse },
        { role: 'user', content: `제가 이해한 내용입니다:\n\n${userExplanation}` },
      ];

      const feedbackText = await streamConversation(messages, explainFeynmanPrompt);
      await offerInsightSave(feedbackText, options.chapter, 'feynman');
    });
}

async function offerInsightSave(
  _responseText: string,
  chapter?: string,
  source: 'manual' | 'feynman' = 'manual'
): Promise<void> {
  console.log('');
  const saveInsight = await confirm({
    message: '이 학습에서 얻은 인사이트를 저장하시겠습니까?',
    default: false,
  });

  if (saveInsight) {
    const insightText = await input({ message: '인사이트 (한 문장):' });
    if (insightText.trim()) {
      addInsight(insightText.trim(), { chapter, source });
      console.log(chalk.green('✓ 인사이트가 저장되었습니다.'));
    }
  }
}
