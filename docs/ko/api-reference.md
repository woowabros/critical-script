---
title: API 레퍼런스
description: 플러그인 옵션과 컴포넌트 props, 프레임워크 호환성을 정리합니다.
sidebar:
  order: 1
---

## 플러그인 옵션

`criticalScriptPlugin`은 다음 옵션을 제공합니다.

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `outputSizeLimit` | `number` | `8192` | 컴파일된 인라인 스크립트의 최대 크기(바이트)입니다. 초과하면 빌드가 실패합니다. |
| `define` | `Record<string, any>` | `{}` | esbuild 빌드 옵션의 `define`으로 그대로 전달됩니다. 주로 빌드 시 환경 변수를 주입할 때 사용합니다. |

### outputSizeLimit

컴파일된 인라인 스크립트의 최대 크기(바이트)입니다. 최대 크기 제한을 초과하면 빌드가 실패합니다. 기본값 `8192`에는 다음과 같은 의도가 담겨 있습니다.

1. **도구의 본질적 역할 유지**: critical-script는 **메인 JS 번들보다 먼저 실행되어야 하는 작업을 위한 도구**입니다. 무거운 로직은 일반 JS 번들에 두어야 합니다. 작은 용량은 이 원칙을 빌드 단계에서 강제하는 장치입니다.
2. **실수 방지**: 큰 라이브러리를 무심코 import한 코드가 PR에 포함되더라도 빌드가 실패하므로 즉시 발견할 수 있습니다.
3. **후속 JS 번들 다운로드 지연 방지**: 인라인 스크립트가 클수록 그 뒤에 있는 `<script src="bundle.js">`의 다운로드 시작 시점이 늦어집니다. 인라인 코드로 벌어 둔 시간이 메인 번들 도착 지연으로 상쇄되면 전체 성능이 오히려 나빠질 수 있습니다.

`outputSizeLimit`은 가능한 한 작은 인라인 스크립트를 유지하도록 유도하기 위한 기본값입니다. 특별한 이유가 없다면 변경하지 않는 것을 권장합니다.

### define

esbuild 빌드 옵션의 `define`으로 그대로 전달됩니다. 일반적으로 환경 변수를 빌드 시점에 주입할 때 사용합니다.

```ts
criticalScriptPlugin({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.API_URL': JSON.stringify('https://api.example.com'),
  },
})
```

## `<CriticalScript />` 컴포넌트 Props

import한 critical script 컴포넌트는 표준 HTML `<script>` 요소의 속성을 모두 지원합니다.

```tsx
<CriticalScript id="my-script" nonce={nonce} />
```

컴포넌트는 자동으로 `suppressHydrationWarning`을 적용하고, 스크립트 크기를 나타내는 `data-size` 속성을 함께 붙입니다.

## 호환성

### 프레임워크 지원

| 프레임워크 | 패키지 | 지원 버전 |
|-----------|--------|----------|
| [vite](https://github.com/vitejs/vite) | `@woowabros/vite-plugin-critical-script` | 5.x |
| [react-router](https://github.com/remix-run/react-router) | `@woowabros/vite-plugin-critical-script` | 7.x |
| [@tanstack/react-start](https://github.com/TanStack/router) | `@woowabros/vite-plugin-critical-script` | 1.x |

### React 버전

- 17.x
- 18.x
- 19.x
