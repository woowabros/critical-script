---
title: 시작하기
description: 플러그인을 설치하고 vite.config.ts에 등록해 첫 크리티컬 스크립트를 인라인합니다.
sidebar:
  order: 1
---

## 설치

```bash
npm install -D @woowabros/vite-plugin-critical-script
# 또는
pnpm add -D @woowabros/vite-plugin-critical-script
```

## 사용법

1. `vite.config.ts`에 플러그인을 등록합니다.

```ts
import { defineConfig } from 'vite'
import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'

export default defineConfig({
  plugins: [criticalScriptPlugin({ outputSizeLimit: 8192 })],
})
```

2. critical로 실행할 코드를 별도 파일로 작성합니다.

```ts
// home.critical.ts
window.__home = fetch('/api/home').then((r) => r.json())
```

3. 컴포넌트에서 `?as-critical-script` suffix 로 import 합니다.

```tsx
import CriticalScript from './home.critical?as-critical-script'

export default function Home() {
  return (
    <>
      <CriticalScript />
      <Page />
    </>
  )
}
```

빌드 시 `home.critical.ts`가 esbuild로 컴파일·minify되어 HTML 의 `<script>` 태그로 인라인됩니다. `define` 등 플러그인 옵션은 [API 레퍼런스](../api-reference/)를, 활용 패턴은 [활용 사례](../use-cases/)를 참고하세요.

## 출력 예시

다음과 같은 `home.critical.ts`가 있을 때,

```ts
performance.mark('critical-start')
window.__home = fetch('/api/home').then((r) => r.json())
```

빌드 후 HTML에 다음과 같이 인라인됩니다 (esbuild minify 적용).

```html
<script data-size="95">(()=>{performance.mark("critical-start");window.__home=fetch("/api/home").then(r=>r.json())})();</script>
```

- 스크립트는 IIFE로 래핑되어 전역 스코프를 오염시키지 않습니다.
- `data-size` 속성으로 압축 후 바이트 크기를 즉시 확인할 수 있어 디버깅·모니터링에 활용합니다.

## TypeScript 설정

`?as-critical-script` import의 타입 정의를 IDE와 빌드 도구가 인식하려면 `tsconfig.json` 의 `compilerOptions.types` 에 패키지명을 추가합니다.

```json
{
  "compilerOptions": {
    "types": ["@woowabros/vite-plugin-critical-script"]
  }
}
```

이 설정으로 `import CriticalScript from './foo.critical?as-critical-script'` 의 default export가 표준 HTML `<script>` 속성을 받는 React 컴포넌트로 타입 추론됩니다.
