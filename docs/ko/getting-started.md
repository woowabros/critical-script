---
title: 시작하기
description: 플러그인을 설치하고 vite.config.ts에 등록한 후, 첫 번째 인라인 스크립트를 작성하세요.
sidebar:
  order: 1
---

## 설치

```bash
npm install -D @woowabros/vite-plugin-critical-script
# 또는
yarn add -D @woowabros/vite-plugin-critical-script
# 또는
pnpm add -D @woowabros/vite-plugin-critical-script
```

## 사용 방법

1. `vite.config.ts`에 플러그인을 등록하세요.

```ts
import { defineConfig } from 'vite'
import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'

export default defineConfig({
  plugins: [criticalScriptPlugin({ outputSizeLimit: 8192 })],
})
```

1. 메인 번들보다 먼저 실행할 코드를 별도의 파일에 작성하세요.

```ts
// home.critical.ts
window.__home = fetch('/api/home').then((r) => r.json())
```

1. 컴포넌트에서 `?as-critical-script` suffix를 붙여 import하세요.

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

빌드 시 `home.critical.ts`는 esbuild를 통해 컴파일 및 minify되어 HTML의 `<script>` 태그에 인라인됩니다. `define` 등 플러그인 옵션은 [API 레퍼런스](./api-reference.md)에서, 다양한 활용 패턴은 [활용 사례](./use-cases.md)에서 확인할 수 있습니다.

## 출력 예시

예를 들어 `home.critical.ts`가 다음과 같다면,

```ts
performance.mark('critical-start')
window.__home = fetch('/api/home').then((r) => r.json())
```

빌드하면 HTML에 다음과 같이 인라인됩니다.

<!-- prettier-ignore -->
```html
<script data-size="98">(()=>{performance.mark("critical-start");window.__home=fetch("/api/home").then(e=>e.json());})();</script>
```

- 스크립트는 IIFE로 래핑되어 전역 스코프에 내부 변수를 노출하지 않습니다.
- `data-size` 속성으로 minify 후 바이트 크기를 즉시 확인할 수 있어 디버깅이나 모니터링에 활용할 수 있습니다.

## TypeScript 설정

`?as-critical-script` 로 가져온 모듈의 타입 정의를 IDE와 빌드 도구가 인식하려면 `tsconfig.json`의 `compilerOptions.types`에 패키지 이름을 추가하세요.

```json
{
  "compilerOptions": {
    "types": ["@woowabros/vite-plugin-critical-script"]
  }
}
```

이 설정을 적용하면 `import CriticalScript from './foo.critical?as-critical-script'`의 default export가 표준 HTML `<script>` 속성을 받을 수 있는 React 컴포넌트로 추론됩니다.
