import { Command } from 'commander';
import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { getProgress, markChapter, addProgressNote, getInsights } from '../storage/index.js';
import { printHeader, printDivider } from '../utils/display.js';

export function registerProgress(program: Command): void {
  const progress = program
    .command('progress')
    .description('학습 진도를 관리합니다 (전략 5)')
    .action(showProgress);

  // progress mark
  progress
    .command('mark <chapter>')
    .description('챕터를 학습 완료로 표시합니다')
    .action(async (chapter: string) => {
      markChapter(chapter);
      console.log(chalk.green(`✓ 챕터 ${chapter}을(를) 학습 완료로 표시했습니다.`));

      const addNote = await confirm({
        message: '노트를 추가하시겠습니까?',
        default: false,
      });

      if (addNote) {
        const noteText = await input({ message: '노트:' });
        if (noteText.trim()) {
          addProgressNote(chapter, noteText.trim());
          console.log(chalk.green('✓ 노트가 추가되었습니다.'));
        }
      }
    });

  // progress note
  progress
    .command('note <chapter> <text>')
    .description('챕터에 노트를 추가합니다')
    .action((chapter: string, text: string) => {
      addProgressNote(chapter, text);
      console.log(chalk.green(`✓ 챕터 ${chapter}에 노트가 추가되었습니다.`));
    });
}

function showProgress(): void {
  printHeader('학습 진도');

  const store = getProgress();
  const insights = getInsights();
  const chapters = Object.entries(store.chapters);

  if (chapters.length === 0) {
    console.log(chalk.gray('아직 학습 기록이 없습니다.'));
    console.log(chalk.gray('`tslearn progress mark <챕터>` 로 학습을 기록하세요.'));
    return;
  }

  const insightCountByChapter: Record<string, number> = {};
  for (const insight of insights) {
    if (insight.chapter) {
      insightCountByChapter[insight.chapter] =
        (insightCountByChapter[insight.chapter] ?? 0) + 1;
    }
  }

  const sortedChapters = chapters.sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  for (const [chapter, data] of sortedChapters) {
    const status = data.studied ? chalk.green('✓') : chalk.gray('○');
    const date = data.studiedAt
      ? chalk.gray(new Date(data.studiedAt).toLocaleDateString('ko-KR'))
      : '';
    const insightCount = insightCountByChapter[chapter] ?? 0;
    const insightBadge =
      insightCount > 0 ? chalk.cyan(`💡 ${insightCount}개`) : chalk.gray('인사이트 없음');

    console.log(`${status} ${chalk.bold(`챕터 ${chapter}`)}  ${date}  ${insightBadge}`);

    if (data.notes.length > 0) {
      for (const note of data.notes) {
        console.log(`   ${chalk.gray('→')} ${note}`);
      }
    }
  }

  printDivider();

  const studied = chapters.filter(([, d]) => d.studied).length;
  const totalInsights = insights.length;

  console.log(
    chalk.bold(`학습 완료: ${studied}/${chapters.length}개 챕터`) +
    `  |  ` +
    chalk.cyan(`총 인사이트: ${totalInsights}개`)
  );
}
