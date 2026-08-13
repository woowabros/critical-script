---
title: API 레퍼런스
description: 플러그인 옵션, 컴포넌트 props, 프레임워크 호환성을 정리합니다.
sidebar:
  order: 1
---

## 플러그인 옵션

`criticalScriptPlugin`은 다음 옵션을 제공합니다.

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `outputSizeLimit` | `number` | `8192` | 컴파일된 인라인 스크립트의 최대 크기(바이트). 초과하면 빌드가 실패합니다. |
| `define` | `Record<string, string>` | `{}` | esbuild의 `define` 옵션으로 그대로 전달됩니다. 주로 빌드 시점에 환경 변수나 상수를 주입할 때 사용합니다. |
| `target` | `string \| string[]` | `esnext` | 인라인 스크립트를 변환할 언어 수준 또는 브라우저 버전. esbuild로 그대로 전달됩니다. |

### outputSizeLimit

컴파일된 인라인 스크립트의 최대 크기(바이트)를 지정합니다. 최대 크기 제한을 초과하면 빌드가 실패합니다. 기본값 `8192`에는 다음과 같은 의도가 있습니다.

1. **플러그인의 역할 유지**: critical-script는 **메인 JS 번들보다 먼저 실행해야 하는 작업을 위한 도구**입니다. 실행 비용이 큰 로직은 일반 JS 번들에 포함해야 합니다. 작은 크기 제한을 통해 이 원칙을 빌드 단계에서 강제할 수 있습니다.
2. **실수 방지**: 큰 라이브러리를 실수로 import한 코드가 PR에 포함되더라도 빌드가 실패하므로 문제를 빠르게 발견할 수 있습니다.
3. **메인 JS 번들의 다운로드 지연 방지**: 인라인 스크립트가 클수록 그 뒤에 있는 `<script src="bundle.js">`의 다운로드 시작이 늦어집니다. 인라인 스크립트로 확보한 시간이 메인 번들의 다운로드 지연으로 상쇄되면 전체 성능이 오히려 저하될 수 있습니다.

`outputSizeLimit`은 가능한 한 작은 인라인 스크립트를 유지하도록 유도하기 위한 장치입니다. 특별한 이유가 없다면 기본값을 유지하는 것을 권장합니다.

### define

esbuild의 `define` 옵션으로 그대로 전달됩니다. 일반적으로 환경 변수나 상수를 빌드 시점에 주입할 때 사용합니다.

```ts
criticalScriptPlugin({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.API_URL': JSON.stringify('https://api.example.com'),
  },
})
```

### target

인라인 스크립트를 어떤 언어 수준 또는 브라우저 버전까지 변환할지 지정합니다. 이 옵션은 esbuild로 그대로 전달되므로 esbuild가 지원하는 형식을 모두 사용할 수 있습니다.

```ts
criticalScriptPlugin({ target: 'es2017' })
criticalScriptPlugin({ target: ['chrome87', 'safari14'] })
```

별도로 지정하지 않으면 esbuild 기본값인 `esnext`가 적용됩니다. 지원 대상 브라우저에 맞는 값을 명시적으로 지정하는 것을 권장합니다.

`target`은 JavaScript 문법의 변환 대상만 지정하며 API 폴리필은 제공하지 않습니다. 또한 critical-script는 메인 JS 번들보다 먼저 실행되므로 메인 번들이 제공하는 변환이나 폴리필에 의존할 수 없습니다.

1. **스크립트가 실행되지 않을 수 있습니다**: 지원하지 않는 문법이나 구문으로 인해 브라우저에서 스크립트 전체가 실행되지 않을 수 있습니다.
2. **애플리케이션의 지원 대상과 맞춰야 합니다**: 구형 브라우저를 지원한다면 인라인 스크립트도 동일한 브라우저 환경을 고려해 `target`을 지정해야 안전합니다.

## `<CriticalScript />` 컴포넌트 Props

`?as-critical-script`로 import한 critical-script 컴포넌트는 표준 HTML `<script>` 요소에서 사용할 수 있는 속성을 지원합니다.

```tsx
<CriticalScript id="my-script" nonce={nonce} />
```

컴포넌트에는 `suppressHydrationWarning`이 자동으로 적용되며, 스크립트 크기를 나타내는 `data-size` 속성도 함께 추가됩니다.

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
