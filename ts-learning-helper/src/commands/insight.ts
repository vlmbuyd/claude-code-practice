import { Command } from 'commander';
import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import {
  addInsight,
  getInsights,
  searchInsights,
} from '../storage/index.js';
import { printHeader, printDivider } from '../utils/display.js';
import type { Insight } from '../storage/types.js';

function formatInsight(insight: Insight, index: number): string {
  const date = new Date(insight.createdAt).toLocaleDateString('ko-KR');
  const chapter = insight.chapter ? chalk.cyan(`[챕터 ${insight.chapter}]`) : '';
  const tags =
    insight.tags.length > 0
      ? chalk.gray(`#${insight.tags.join(' #')}`)
      : '';
  const source = chalk.gray(`(${insight.source})`);

  return (
    chalk.bold(`${index + 1}. `) +
    insight.text +
    `\n   ${chapter} ${date} ${source} ${tags}`.trim()
  );
}

export function registerInsight(program: Command): void {
  const insight = program
    .command('insight')
    .description('학습 인사이트를 관리합니다 (전략 8)');

  // insight add
  insight
    .command('add [text]')
    .description('인사이트를 추가합니다')
    .option('-c, --chapter <n>', '관련 챕터')
    .option('-t, --tags <tags>', '태그 (쉼표로 구분)')
    .action(
      async (
        text: string | undefined,
        options: { chapter?: string; tags?: string }
      ) => {
        let insightText = text;

        if (!insightText) {
          insightText = await input({
            message: '인사이트를 입력하세요:',
            validate: (v: string) =>
              v.trim().length > 0 ? true : '내용을 입력해주세요.',
          });
        }

        let chapter = options.chapter;
        if (!chapter) {
          const chapterInput = await input({
            message: '관련 챕터/아이템 (없으면 Enter):',
          });
          chapter = chapterInput || undefined;
        }

        const tags = options.tags
          ? options.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

        const saved = addInsight(insightText.trim(), { chapter, tags, source: 'manual' });
        console.log(chalk.green(`\n✓ 인사이트가 저장되었습니다. (ID: ${saved.id.slice(0, 8)})`));
      }
    );

  // insight list
  insight
    .command('list')
    .description('저장된 인사이트 목록')
    .option('-c, --chapter <n>', '특정 챕터만 보기')
    .action((options: { chapter?: string }) => {
      printHeader('학습 인사이트');

      let insights = getInsights();

      if (options.chapter) {
        insights = insights.filter((i) => i.chapter === options.chapter);
      }

      if (insights.length === 0) {
        console.log(chalk.gray('저장된 인사이트가 없습니다.'));
        console.log(chalk.gray('`tslearn insight add` 로 인사이트를 추가하세요.'));
        return;
      }

      insights.forEach((ins, i) => {
        console.log(formatInsight(ins, i));
        if (i < insights.length - 1) printDivider();
      });

      console.log(`\n${chalk.bold(`총 ${insights.length}개의 인사이트`)}`);
    });

  // insight search
  insight
    .command('search <query>')
    .description('인사이트 검색')
    .action((query: string) => {
      const results = searchInsights(query);

      if (results.length === 0) {
        console.log(chalk.yellow(`"${query}"에 대한 인사이트가 없습니다.`));
        return;
      }

      printHeader(`검색 결과: "${query}"`);
      results.forEach((ins, i) => {
        console.log(formatInsight(ins, i));
        if (i < results.length - 1) printDivider();
      });
      console.log(`\n${chalk.bold(`${results.length}개 발견`)}`);
    });

  // insight export
  insight
    .command('export')
    .description('모든 인사이트를 텍스트로 출력')
    .action(() => {
      const insights = getInsights();

      if (insights.length === 0) {
        console.log(chalk.gray('저장된 인사이트가 없습니다.'));
        return;
      }

      console.log('# 이펙티브 타입스크립트 학습 인사이트\n');
      console.log(`총 ${insights.length}개 | 생성일: ${new Date().toLocaleDateString('ko-KR')}\n`);
      console.log('---\n');

      const byChapter: Record<string, Insight[]> = {};
      const noChapter: Insight[] = [];

      for (const ins of insights) {
        if (ins.chapter) {
          if (!byChapter[ins.chapter]) byChapter[ins.chapter] = [];
          byChapter[ins.chapter].push(ins);
        } else {
          noChapter.push(ins);
        }
      }

      for (const [chapter, list] of Object.entries(byChapter).sort()) {
        console.log(`## 챕터 ${chapter}\n`);
        list.forEach((i) => console.log(`- ${i.text}`));
        console.log('');
      }

      if (noChapter.length > 0) {
        console.log('## 기타\n');
        noChapter.forEach((i) => console.log(`- ${i.text}`));
      }
    });

  // insight add (interactive, no args) - also handle confirm prompt for future
  insight.action(async () => {
    // Show help when no subcommand is given
    const shouldAdd = await confirm({
      message: '인사이트를 추가하시겠습니까?',
      default: true,
    });

    if (shouldAdd) {
      const insightText = await input({ message: '인사이트를 입력하세요:' });
      const chapterInput = await input({ message: '관련 챕터/아이템 (없으면 Enter):' });
      if (insightText.trim()) {
        addInsight(insightText.trim(), {
          chapter: chapterInput || undefined,
          source: 'manual',
        });
        console.log(chalk.green('✓ 인사이트가 저장되었습니다.'));
      }
    } else {
      insight.help();
    }
  });
}
