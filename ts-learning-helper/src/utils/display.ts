import chalk from 'chalk';

export function printHeader(text: string): void {
  console.log('\n' + chalk.bold.cyan('━'.repeat(50)));
  console.log(chalk.bold.cyan(`  ${text}`));
  console.log(chalk.bold.cyan('━'.repeat(50)) + '\n');
}

export function printSection(label: string): void {
  console.log('\n' + chalk.bold.yellow(`▶ ${label}`));
}

export function printSuccess(text: string): void {
  console.log(chalk.green(`✓ ${text}`));
}

export function printInfo(text: string): void {
  console.log(chalk.gray(text));
}

export function printDivider(): void {
  console.log(chalk.gray('─'.repeat(50)));
}
