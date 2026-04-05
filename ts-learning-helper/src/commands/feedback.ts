import { Command } from 'commander';
import { confirm, input, editor } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs';
import { streamToTerminal } from '../ai/stream.js';
import { feedbackPrompt } from '../prompts/feedback.js';
import { addInsight } from '../storage/index.js';
import { printHeader, printSection } from '../utils/display.js';

export function registerFeedback(program: Command): void {
  program
    .command('feedback')
    .description('작성한 TypeScript 코드에 대한 피드백을 받습니다 (전략 6)')
    .option('-f, --file <path>', 'TypeScript 파일 경로')
    .option(
      '-a, --aspect <aspect>',
      '피드백 측면: correctness | style | types | all',
      'all'
    )
    .action(async (options: { file?: string; aspect: string }) => {
      printHeader('코드 피드백');

      let code = '';

      if (options.file) {
        if (!fs.existsSync(options.file)) {
          console.error(chalk.red(`파일을 찾을 수 없습니다: ${options.file}`));
          process.exit(1);
        }
        code = fs.readFileSync(options.file, 'utf-8');
        console.log(chalk.gray(`파일 로드: ${options.file}`));
      } else {
        printSection('코드 붙여넣기');
        console.log(chalk.gray('(에디터가 열립니다. 저장 후 닫으면 피드백이 시작됩니다.)'));
        code = await editor({ message: '피드백받을 코드:' });
      }

      if (!code.trim()) {
        console.log(chalk.yellow('코드가 입력되지 않았습니다.'));
        return;
      }

      const aspectNote =
        options.aspect !== 'all'
          ? `특히 ${options.aspect} 측면에 집중해주세요.`
          : '';

      const userMessage = `다음 TypeScript 코드를 리뷰해주세요. ${aspectNote}\n\n\`\`\`typescript\n${code}\n\`\`\``;

      printSection('피드백');
      await streamToTerminal(userMessage, feedbackPrompt);

      console.log('');
      const saveInsight = await confirm({
        message: '"기록할 인사이트"를 저장하시겠습니까?',
        default: false,
      });

      if (saveInsight) {
        const insightText = await input({ message: '인사이트 (한 문장):' });
        if (insightText.trim()) {
          addInsight(insightText.trim(), { source: 'feedback' });
          console.log(chalk.green('✓ 인사이트가 저장되었습니다.'));
        }
      }
    });
}
