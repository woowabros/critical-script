# critical-script 기여 가이드

critical-script에 관심을 가져 주셔서 감사합니다. 이 문서는 프로젝트에 기여할 때 따라야 할 가이드라인과 절차를 설명합니다.

## 시작하기

### 사전 요구 사항

이 프로젝트는 공급망 보안을 위해 `package.json`의 `devEngines` 필드로 도구 버전을 정확히 고정합니다.

- Node.js **24.15.0**
- pnpm **11.1.2**

Node.js는 직접 설치하지 **않아도** 됩니다. pnpm 11 이상이 설치되어 있기만 하면, `pnpm install`이 `devEngines`를 읽어 위에 명시된 정확한 Node.js와 pnpm 버전을 자동으로 다운로드합니다(`onFail: "download"`). 체크섬은 `pnpm-lock.yaml`에 기록됩니다.

### 설치 절차

1\. 저장소를 포크한 뒤 클론합니다.

```bash
git clone https://github.com/your-username/critical-script.git
cd critical-script
```

2\. pnpm을 설치합니다.

```bash
# 옵션 A — 공식 standalone 설치 스크립트 (Node.js 없이도 동작)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 옵션 B — Homebrew (macOS)
brew install pnpm

# 옵션 C — Corepack (Node.js 16.10+에 기본 포함)
corepack enable
corepack prepare pnpm@11.1.2 --activate
```

부트스트랩 단계에서는 pnpm `>= 11.0.0` 이라면 어떤 버전이든 무방합니다. 다음 단계에서 자동으로 `11.1.2`로 정렬됩니다.

3\. 의존성을 설치합니다.

```bash
pnpm install
```

Node.js 24.15.0과 pnpm 11.1.2가 아직 설치되어 있지 않다면 이 단계에서 자동으로 다운로드되고, 이어서 워크스페이스의 모든 의존성이 설치됩니다.

4\. 패키지를 빌드합니다.

```bash
pnpm -r build
```

## 개발

### 프로젝트 구조

```
critical-script/
└── packages/
    └── vite-plugin-critical-script/  # Vite 플러그인
```

### 코드 스타일

이 프로젝트는 코드 포매팅에 ESLint와 Prettier를 사용합니다. Husky 의 pre-commit 훅이 staged 파일에 린트를 자동으로 적용합니다.

```bash
# 수동으로 포맷팅 실행
pnpm lint-staged
```

## 변경사항 제출

### Pull Request 절차

> 전제 조건: 먼저 이 저장소를 **포크**한 뒤 포크를 로컬에 클론합니다 (위 [설치 절차](#설치-절차) 참고). 아래 단계는 포크한 저장소에서 진행합니다.

1\. 포크한 저장소의 `main` 브랜치에서 새 브랜치를 생성합니다.

```bash
git checkout -b feature/your-feature-name
```

2\. 변경사항을 작성하고 명확한 메시지로 커밋합니다.

```bash
git commit -m "feat: add new feature"
```

3\. 포크한 저장소에 푸시한 뒤 원본 저장소로 Pull Request를 엽니다.

### 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

- `feat:` — 새로운 기능
- `fix:` — 버그 수정
- `docs:` — 문서 변경
- `refactor:` — 코드 리팩터링
- `test:` — 테스트 추가 또는 수정
- `chore:` — 기타 유지보수 작업

### 기여자 인증 (DCO)

이 프로젝트는 [Developer Certificate of Origin](DCO)(DCO) 1.1 을 따릅니다. 기여한 코드를 제출할 권리가 본인에게 있음을 인증하는 절차로, **모든 커밋에 sign-off 서명이 필요**합니다.

커밋할 때 `-s`(`--signoff`) 옵션을 붙이면 커밋 메시지 끝에 sign-off 줄이 자동으로 추가됩니다.

```bash
git commit -s -m "feat: add new feature"
```

```
feat: add new feature

Signed-off-by: Your Name <your.email@example.com>
```

- `Signed-off-by` 의 이름·이메일은 git 설정(`user.name`, `user.email`)을 사용하며, 실명이어야 합니다.
- 서명을 빠뜨린 커밋이 있다면 `git commit --amend -s`(마지막 커밋) 또는 `git rebase --signoff <base>`(여러 커밋)로 추가할 수 있습니다.
- 서명은 위 [DCO](DCO) 문서의 (a)~(d) 항목에 동의한다는 의미입니다.

## 이슈 보고

이슈를 보고할 때는 다음 내용을 함께 적어 주세요.

- 문제에 대한 명확한 설명
- 재현 절차
- 기대한 동작과 실제 동작의 차이
- 환경 정보(Node.js 버전, 프레임워크 버전 등)

## 행동 강령

[행동 강령](CODE_OF_CONDUCT.md)을 읽고 따라 주세요.

## 라이선스

기여한 코드는 [MIT License](LICENSE) 를 따릅니다.
