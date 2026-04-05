import { Command } from 'commander';
import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { streamToTerminal } from '../ai/stream.js';
import { keywordsPrompt } from '../prompts/keywords.js';
import { addInsight, addProgressNote } from '../storage/index.js';
import { printHeader } from '../utils/display.js';

export function registerKeywords(program: Command): void {
  program
    .command('keywords <chapter>')
    .description('챕터/아이템의 핵심 학습 키워드를 제안받습니다 (전략 2)')
    .option('-d, --depth <level>', '탐색 깊이: quick | deep', 'quick')
    .action(async (chapter: string, options: { depth: string }) => {
      printHeader(`챕터 ${chapter} 학습 키워드`);

      const depthNote =
        options.depth === 'deep'
          ? '각 키워드에 대해 더 상세한 설명과 코드 예시를 포함해주세요.'
          : '';

      const userMessage = `이펙티브 타입스크립트 챕터/아이템 "${chapter}"의 핵심 학습 키워드를 알려주세요. ${depthNote}`;

      await streamToTerminal(userMessage, keywordsPrompt);

      console.log('');
      const save = await confirm({
        message: '이 키워드를 진도 노트에 저장하시겠습니까?',
        default: false,
      });

      if (save) {
        addProgressNote(chapter, `[키워드 학습] ${new Date().toLocaleDateString('ko-KR')}`);
        console.log(chalk.green(`✓ 챕터 ${chapter} 진도에 기록되었습니다.`));
      }

      const saveInsight = await confirm({
        message: '인사이트로 저장할 내용이 있습니까?',
        default: false,
      });

      if (saveInsight) {
        const insightText = await input({ message: '인사이트를 입력하세요:' });
        if (insightText.trim()) {
          addInsight(insightText.trim(), { chapter, source: 'manual' });
          console.log(chalk.green('✓ 인사이트가 저장되었습니다.'));
        }
      }
    });
}
