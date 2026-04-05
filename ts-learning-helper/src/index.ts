#!/usr/bin/env tsx
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { validateApiKey } from './utils/validate.js';
import { registerKeywords } from './commands/keywords.js';
import { registerExplain } from './commands/explain.js';
import { registerSolve } from './commands/solve.js';
import { registerFeedback } from './commands/feedback.js';
import { registerInsight } from './commands/insight.js';
import { registerProgress } from './commands/progress.js';

const isHelpOrVersion =
  process.argv.includes('--help') ||
  process.argv.includes('-h') ||
  process.argv.includes('--version') ||
  process.argv.includes('-V');

if (!isHelpOrVersion) {
  validateApiKey();
}

const program = new Command();

program
  .name('tslearn')
  .description(
    chalk.bold('이펙티브 타입스크립트 학습 도우미') +
    '\n  당신의 학습 전략에 맞춰 설계된 CLI 도구입니다.'
  )
  .version('1.0.0');

registerKeywords(program);
registerExplain(program);
registerSolve(program);
registerFeedback(program);
registerInsight(program);
registerProgress(program);

program.parse(process.argv);
