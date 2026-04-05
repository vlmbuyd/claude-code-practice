# CLAUDE.md

## 프로젝트 개요

이펙티브 타입스크립트를 읽으며 생기는 **궁금증에 답변해주고**, 필요하다면 관련 예제 코드를 함께 풀어보며 이해를 돕는 학습 도우미 CLI.

"문제 풀이"가 목적이 아니라, **책을 읽으며 생기는 질문과 개념 탐구**가 핵심 사용 흐름입니다.

## 커맨드

```bash
npm install              # 의존성 설치
npm run dev -- <args>   # 개발 모드로 실행 (tsx 사용)
npm run build           # TypeScript 컴파일
npm run typecheck       # 타입 체크 (컴파일 없음)
```

## 환경 설정

`.env.example`을 복사하여 `.env` 파일을 만들고 API 키를 입력하세요:

```bash
cp .env.example .env
# .env 파일에서 ANTHROPIC_API_KEY 설정
```

## CLI 커맨드 목록

| 커맨드 | 설명 |
|---|---|
| `tslearn keywords <chapter>` | 챕터/아이템의 핵심 학습 키워드 제안 |
| `tslearn explain <topic>` | 개념 질문에 답변 (--feynman으로 파인만 기법) |
| `tslearn solve <problem>` | 개념 이해를 위한 예제 코드 탐구 (스스로 먼저 시도 → AI 보조) |
| `tslearn feedback` | 작성한 예제 코드에 대한 피드백 |
| `tslearn insight add/list/search/export` | 학습 중 생긴 인사이트 기록/관리 |
| `tslearn progress` | 챕터 학습 진도 관리 |

> `solve` 커맨드는 "모르는 문제를 푸는" 것이 아니라, **개념을 직접 코드로 확인하는 탐구 도구**로 사용합니다.

## 아키텍처

```
src/
├── index.ts          - CLI 진입점 (commander 셋업)
├── commands/         - 각 커맨드 구현
├── prompts/          - AI 시스템 프롬프트 (핵심 제품 로직)
├── ai/stream.ts      - Anthropic SDK 스트리밍 헬퍼
├── storage/          - JSON 파일 기반 데이터 저장
└── utils/            - 유틸리티 (display, validate)
data/
├── insights.json     - 학습 인사이트 저장
└── progress.json     - 챕터 진도 저장
```

## 새 커맨드 추가 방법

1. `src/prompts/yourcommand.ts` - 시스템 프롬프트 작성
2. `src/commands/yourcommand.ts` - 커맨드 로직 작성
3. `src/index.ts` - `registerYourCommand(program)` 등록
4. 이 파일에 커맨드 문서 추가

## 핵심 설계 원칙

- **시스템 프롬프트 = 제품 핵심 가치**: `src/prompts/`가 사용자 학습 경험을 결정
- **스트리밍 중앙화**: `src/ai/stream.ts`가 모든 AI 출력 처리
- **데이터 영구 보존**: `data/` 디렉토리를 git에 커밋하여 학습 기록 유지
