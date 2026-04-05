import { Command } from 'commander';
import { confirm, input, select, editor } from '@inquirer/prompts';
import chalk from 'chalk';
import { streamToTerminal, streamConversation } from '../ai/stream.js';
import {
  solveHintPrompt,
  solveFullPrompt,
  solveAttemptFeedbackPrompt,
} from '../prompts/solve.js';
import { addInsight } from '../storage/index.js';
import { printHeader, printSection, printInfo } from '../utils/display.js';

export function registerSolve(program: Command): void {
  program
    .command('solve <problem>')
    .description('문제 풀이 워크플로: AI Free 먼저 → 힌트 또는 풀이 (전략 1, 7)')
    .option('--hint', '힌트만 요청 (답 없음)')
    .option('--full', '전체 풀이 요청')
    .action(
      async (problem: string, options: { hint?: boolean; full?: boolean }) => {
        printHeader('문제 풀기');
        console.log(chalk.bold('문제:'), problem);
        console.log('');

        // AI Free 원칙 확인
        const triedSelf = await confirm({
          message: '먼저 스스로 풀어보셨습니까? (AI Free 원칙)',
          default: true,
        });

        if (triedSelf) {
          await handleAttemptMode(problem);
          return;
        }

        // 스스로 시도 안 한 경우: 힌트 또는 풀이 선택
        let mode: 'hint' | 'full';

        if (options.hint) {
          mode = 'hint';
        } else if (options.full) {
          mode = 'full';
        } else {
          mode = await select({
            message: '먼저 혼자 시도해보시길 권장합니다. 그래도 진행하시겠습니까?',
            choices: [
              { name: '힌트만 받기 (권장)', value: 'hint' },
              { name: '전체 풀이 보기', value: 'full' },
            ],
          });
        }

        if (mode === 'hint') {
          printSection('힌트');
          printInfo('답은 없습니다. 방향만 제시합니다.');
          await streamToTerminal(
            `문제: ${problem}\n\n힌트를 주세요.`,
            solveHintPrompt
          );
        } else {
          printSection('전체 풀이');
          const fullText = await streamToTerminal(
            `문제: ${problem}\n\n풀이를 설명해주세요.`,
            solveFullPrompt
          );
          await offerInsightSave(fullText);
        }
      }
    );
}

async function handleAttemptMode(problem: string): Promise<void> {
  printSection('본인의 풀이를 붙여넣으세요');
  console.log(chalk.gray('(에디터가 열립니다. 저장 후 닫으면 피드백이 시작됩니다.)'));

  const attempt = await editor({ message: '풀이 시도:' });

  if (!attempt.trim()) {
    console.log(chalk.yellow('풀이가 입력되지 않았습니다.'));
    return;
  }

  printSection('피드백');
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    {
      role: 'user',
      content: `문제: ${problem}\n\n제 풀이 시도:\n\`\`\`typescript\n${attempt}\n\`\`\`\n\n피드백을 주세요.`,
    },
  ];

  const feedbackText = await streamConversation(messages, solveAttemptFeedbackPrompt);
  await offerInsightSave(feedbackText, 'solve');
}

async function offerInsightSave(
  _responseText: string,
  source: 'manual' | 'solve' = 'manual'
): Promise<void> {
  console.log('');

  const saveInsight = await confirm({
    message: '"기록할 인사이트"를 저장하시겠습니까?',
    default: false,
  });

  if (saveInsight) {
    const insightText = await input({ message: '인사이트 (한 문장):' });
    if (insightText.trim()) {
      addInsight(insightText.trim(), { source });
      console.log(chalk.green('✓ 인사이트가 저장되었습니다.'));
    }
  }
}
