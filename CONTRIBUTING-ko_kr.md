# critical-script 기여 가이드

[English](./CONTRIBUTING.md) | 한국어

critical-script에 관심을 가져 주셔서 감사합니다. 이 문서는 개발 환경을 준비하고 변경 사항을 제출하는 절차를 설명합니다.

## 개발 환경 준비

### 요구 사항

이 저장소는 다음 버전을 사용합니다.

- Node.js **24.15.0**
- pnpm **11.1.2**

[pnpm 설치 가이드](https://pnpm.io/installation)에 따라 pnpm을 설치해 주세요.

### 저장소 설정

1. 저장소를 포크한 뒤 로컬에 클론합니다.

```bash
git clone https://github.com/your-username/critical-script.git
cd critical-script
```

2. 루트 워크스페이스의 의존성을 설치합니다.

```bash
pnpm install
```

문서 사이트와 예제 앱은 루트 워크스페이스에 포함되지 않은 별도 pnpm 프로젝트입니다. 해당 영역을 수정할 때는 각 디렉터리의 의존성도 설치합니다.

```bash
pnpm --dir docs/website install
pnpm --dir examples/vite-react-ssg install
```

## 프로젝트 구조

```text
critical-script/
├── packages/
│   └── vite-plugin-critical-script/  # 플러그인 소스, 테스트, 빌드 설정
├── examples/
│   └── vite-react-ssg/               # Vite 기반 React SSG 예제
├── docs/
│   ├── en/, ko/                       # 영어 및 한국어 문서 원본
│   └── website/                       # Astro 및 Starlight 문서 사이트
└── .github/workflows/                 # CI, 배포, 릴리스 워크플로
```

- `packages/vite-plugin-critical-script/`는 npm에 배포되는 플러그인 패키지입니다.
- `examples/vite-react-ssg/`는 배포된 플러그인을 사용하는 독립 실행형 예제입니다.
- `docs/website/`는 자체 lockfile을 사용하는 별도 프로젝트이며, `docs/en/`과 `docs/ko/`가 문서 원본입니다.

## 개발 및 검증

플러그인을 수정했다면 루트에서 다음 검사를 실행합니다.

```bash
pnpm -r lint
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

문서 사이트를 수정했다면 다음 검사를 실행합니다.

```bash
pnpm --dir docs/website typecheck
pnpm --dir docs/website build
```

예제 앱을 수정했다면 다음 검사를 실행합니다.

```bash
pnpm --dir examples/vite-react-ssg typecheck
pnpm --dir examples/vite-react-ssg build
```

변경한 영역에 맞는 테스트와 문서를 함께 수정해 주세요.

### 코드 스타일

이 프로젝트는 ESLint와 Prettier를 사용합니다. Husky의 pre-commit 훅은 스테이징된 파일에 필요한 검사를 적용합니다. 같은 검사를 직접 실행하려면 다음 명령을 사용합니다.

```bash
pnpm lint-staged
```

## 변경 사항 제출

### Pull Request 절차

1. 포크한 저장소의 `main` 브랜치를 최신 상태로 맞춥니다.
2. 작업 내용을 나타내는 새 브랜치를 만듭니다.

```bash
git switch -c feature/your-feature-name
```

3. 변경 사항을 구현하고 관련 검사를 실행합니다.
4. 모든 커밋에 DCO sign-off를 추가합니다.

```bash
git commit -s -m "feat: add new feature"
```

5. 브랜치를 포크한 저장소에 푸시하고 원본 저장소를 대상으로 Pull Request를 엽니다.

Pull Request에는 변경 목적과 주요 내용, 검증 방법을 적어 주세요. 동작이 달라졌다면 관련 테스트와 문서도 포함합니다.

### 커밋 메시지

커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `refactor:` 동작을 바꾸지 않는 코드 구조 변경
- `test:` 테스트 추가 또는 수정
- `chore:` 기타 유지보수 작업

### 기여자 인증

이 프로젝트는 [Developer Certificate of Origin(DCO) 1.1](./DCO)을 따릅니다. 모든 커밋에는 해당 기여를 제출할 권리가 있음을 확인하는 sign-off가 필요합니다.

`git commit`에 `-s` 또는 `--signoff` 옵션을 추가하면 커밋 메시지 끝에 서명 줄이 생성됩니다.

```text
Signed-off-by: Your Name <your.email@example.com>
```

`Signed-off-by`의 이름과 이메일에는 Git의 `user.name`과 `user.email` 설정이 사용됩니다. 서명을 빠뜨렸다면 마지막 커밋에는 `git commit --amend -s`, 여러 커밋에는 `git rebase --signoff <base>`를 사용할 수 있습니다.

## 이슈 보고

이슈를 보고할 때는 다음 정보를 포함해 주세요.

- 문제에 대한 명확한 설명
- 문제를 재현하는 절차 또는 최소 예제
- 기대한 동작과 실제 동작의 차이
- Node.js, Vite, 프레임워크 등 관련 환경 정보

## 행동 강령

모든 기여자는 [행동 강령](./CODE_OF_CONDUCT.md)을 따라야 합니다.

## 라이선스

제출한 기여에는 이 저장소의 [MIT License](./LICENSE)가 적용됩니다.
