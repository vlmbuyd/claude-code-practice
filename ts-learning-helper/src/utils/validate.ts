import chalk from 'chalk';

export function validateApiKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      chalk.red('오류: ANTHROPIC_API_KEY가 설정되지 않았습니다.\n') +
      chalk.yellow('.env.example을 복사하여 .env 파일을 만들고 API 키를 입력하세요.\n') +
      chalk.gray('  cp .env.example .env')
    );
    process.exit(1);
  }
}
