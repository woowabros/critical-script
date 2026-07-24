# critical-script

critical-script는 React prerender 환경에서 TypeScript 코드를 인라인 `<script>` 태그로 만들어 HTML에 삽입하는 vite 플러그인입니다. 메인 JavaScript 번들이 로드·실행되기 전 타이밍을 활용해 API 프리페치, 리소스 프리로드, 웹뷰 네이티브 브릿지, LCP 최적화 같은 작업을 처리합니다.

`?as-critical-script` 로 import 하면 React 컴포넌트가 만들어지고, 이 컴포넌트가 빌드 단계에서 HTML로 렌더링될 때 인라인 스크립트가 삽입됩니다. 따라서 [react-router](https://github.com/remix-run/react-router)(framework mode), [@tanstack/react-start](https://github.com/TanStack/router) 처럼 HTML을 미리 렌더링하는 React 프레임워크에서 동작합니다.

```tsx
import CriticalScript from './my-script?as-critical-script'

export default function Home() {
  return (
    <>
      <CriticalScript />
      <Page />
    </>
  )
}
```

## 주요 기능

- `import CriticalScript from '*?as-critical-script'` 모듈 지정자로 워크스페이스 안의 소스 코드를 인라인 스크립트로 변환합니다.
- TypeScript로 작성하면 컴파일 시점에 타입 검사를 거칩니다.
- esbuild가 컴파일과 minify를 처리해 인라인 스크립트가 최소 크기로 유지됩니다.
- 인라인 스크립트가 커지면 HTML 크기도 함께 커지므로, 출력 크기에 상한을 둘 수 있습니다. 초과하면 빌드가 실패합니다.
- vite 기반 프레임워크(react-router, @tanstack/react-start 등)를 지원합니다.

## 설계 의도

critical-script 는 **메인 JS 번들이 로드되기 전에 실행되어야 의미가 있는** 작업을 *최소한의 코드* 로 수행하기 위한 도구입니다.

- 메인 JS 번들이 도착하기 전에 시작해야 의미가 있는 작업, 그러니까 API 프리페치나 리소스 프리로드, 웹뷰 브릿지 같은 것만 인라인합니다.
- 동기 계산이나 큰 라이브러리 사용처럼 무거운 로직은 일반 JS 번들에 두세요. 인라인 스크립트에 욱여넣으면 이 도구의 의미가 없어집니다.
- 기본 `outputSizeLimit` 8192바이트가 이 원칙을 빌드 단계에서 강제합니다. 자세한 근거는 [API 레퍼런스 > outputSizeLimit](#outputsizelimit) 를 참조하세요.

## 설치

```bash
npm install -D @woowabros/vite-plugin-critical-script
# 또는
pnpm add -D @woowabros/vite-plugin-critical-script
```

## 사용법

1. `vite.config.ts` 에 플러그인을 등록합니다.

```ts
import { defineConfig } from 'vite'
import { criticalScriptPlugin } from '@woowabros/vite-plugin-critical-script'

export default defineConfig({
  plugins: [criticalScriptPlugin({ outputSizeLimit: 8192 })],
})
```

2. critical 로 실행할 코드를 별도 파일로 작성합니다.

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

빌드 시 `home.critical.ts` 가 esbuild 로 컴파일·minify 되어 HTML 의 `<script>` 태그로 인라인됩니다. `define` 등 플러그인 옵션은 [API 레퍼런스](#api-레퍼런스) 를, 활용 패턴은 [활용 사례](#활용-사례) 를 참고하세요.

## 출력 예시

다음 `home.critical.ts` 가 있다고 합시다.

```ts
performance.mark('critical-start')
window.__home = fetch('/api/home').then((r) => r.json())
```

빌드 후 HTML 에 다음과 같이 인라인됩니다 (esbuild minify 적용).

```html
<script data-size="95">(()=>{performance.mark("critical-start");window.__home=fetch("/api/home").then(r=>r.json())})();</script>
```

- 스크립트는 IIFE 로 래핑되어 전역 스코프를 오염시키지 않습니다.
- `data-size` 속성으로 압축 후 바이트 크기를 즉시 확인할 수 있어 디버깅·모니터링에 활용합니다.

## TypeScript 설정

`?as-critical-script` import 의 타입 정의를 IDE 와 빌드 도구가 인식하려면 `tsconfig.json` 의 `compilerOptions.types` 에 패키지명을 추가합니다.

```json
{
  "compilerOptions": {
    "types": ["@woowabros/vite-plugin-critical-script"]
  }
}
```

이 설정으로 `import CriticalScript from './foo.critical?as-critical-script'` 의 default export 가 표준 HTML `<script>` 속성을 받는 React 컴포넌트로 타입 추론됩니다.

## 활용 사례

크리티컬 스크립트는 메인 JS 번들이 다운로드·파싱되기 *전에* 실행됩니다. 이 타이밍은 다음과 같은 작업에 유용합니다.

### API 프리페치

HTML이 파싱될 때 요청을 시작해두고, 앱이 부팅된 뒤 응답을 받아 씁니다:

```ts
// home.critical.ts
window.__homeApi = fetch('/api/home').then((r) => r.json())
```

```tsx
// HomePage.tsx
useEffect(() => {
  window.__homeApi.then(setData)
}, [])
```

### 런타임에 결정되는 리소스 프리로드

API 응답에서 LCP 이미지 URL을 받아 곧바로 `<link rel="preload">` 를 삽입합니다:

```ts
// home.critical.ts
const data = await fetch('/api/home').then((r) => r.json())
const link = document.createElement('link')
link.rel = 'preload'
link.as = 'image'
link.href = data.heroImageUrl
document.head.appendChild(link)
```

### 웹뷰 네이티브 브릿지

하이브리드 앱 환경에서 React가 렌더되기 전에 네이티브가 넘긴 값을 읽어와, 스켈레톤 UI를 디바이스 상태에 맞춰 깜빡임 없이 표시합니다. iOS 의 홈 인디케이터·하단 고정 영역처럼 하단 safe-area 보정에 자주 쓰입니다:

```ts
// home.critical.ts
const inset = window.AppBridge?.getSafeAreaInsets?.()
if (inset) {
  document.documentElement.style.setProperty('--inset-bottom', `${inset.bottom}px`)
}
```

### LCP 최적화 (사례)

API 프리페치 패턴은 배달의민족의 다양한 웹뷰 지면에서 성능 최적화에 쓰이고 있습니다. 대표적으로 커머스 웹에서는 적용 전 대비 LCP(Largest Contentful Paint)가 30~40% 개선되었습니다.

## API 레퍼런스

### 플러그인 옵션

`criticalScriptPlugin`은 다음 옵션을 받습니다:

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `outputSizeLimit` | `number` | `8192` | 컴파일된 인라인 스크립트의 최대 크기(바이트). 초과 시 빌드 실패. |
| `define` | `Record<string, any>` | `{}` | 빌드 시 치환될 전역 상수 (esbuild의 define과 유사). |

#### outputSizeLimit

컴파일된 인라인 스크립트의 최대 크기(바이트). 한도를 넘으면 빌드가 실패합니다. 기본값 `8192` 에는 네 가지 의도가 담겨 있습니다.

1. **첫 TCP 패킷 안에 HTML 담기**: RFC 6928 기준으로 TCP 초기 혼잡 윈도우(initcwnd)는 10 세그먼트, 즉 약 14KB 입니다. 압축된 `index.html` 전체가 14KB 안에 들어가면 첫 왕복에서 HTML 이 모두 도착해 초기 렌더링이 빨라집니다. 8192바이트는 HTML 의 나머지 콘텐츠와 합쳐졌을 때도 여유를 둔 값입니다.
2. **본질적 역할 유지**: critical-script 는 **메인 JS 번들이 로드되기 전에 실행되어야 의미가 있는** 작업을 위한 도구입니다. 무거운 로직을 인라인 스크립트에 담으면 이 도구를 쓰는 의미가 사라지며, 그런 로직은 일반 JS 번들에 두는 것이 맞습니다. 작은 한도는 이 원칙을 빌드 단계에서 강제하는 장치입니다.
3. **실수 감지 장치**: 무심코 큰 라이브러리를 `import` 한 코드가 PR 에 섞여 들어와도 빌드가 실패해 즉시 발견됩니다.
4. **후속 JS 번들 다운로드 지연 방지**: 인라인 스크립트가 클수록 그 뒤에 위치한 `<script src="bundle.js">` 의 발견·다운로드 시작이 늦어집니다. 인라인 코드로 벌어둔 시간이 메인 번들 도착 지연으로 상쇄되면 전체 성능이 오히려 나빠질 수 있습니다.

> 14KB 는 TCP MSS(약 1460B) × initcwnd(10) 기준 추정치이며 실제 네트워크 환경에 따라 달라질 수 있습니다. 정확한 값보다 "**최소한으로 유지하라**" 는 원칙이 더 중요합니다.

#### define

빌드 시 전역 상수로 치환할 값을 정의합니다:

```ts
criticalScriptPlugin({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.API_URL': JSON.stringify('https://api.example.com'),
  },
})
```

### Critical Script 컴포넌트 Props

import 된 critical script 컴포넌트는 표준 HTML `<script>` 속성을 받습니다:

```tsx
<CriticalScript id="my-script" nonce={nonce} />
```

컴포넌트는 자동으로 `suppressHydrationWarning`을 설정하고, 스크립트 크기를 나타내는 `data-size` 속성을 함께 붙입니다.

## 호환성

### 프레임워크 지원

| 프레임워크 | 패키지 | 지원 버전 |
|-----------|--------|----------|
| vite | `@woowabros/vite-plugin-critical-script` | 5.x |
| [react-router](https://github.com/remix-run/react-router) | `@woowabros/vite-plugin-critical-script` | 7.x |
| [@tanstack/react-start](https://github.com/TanStack/router) | `@woowabros/vite-plugin-critical-script` | 1.x |

### React 버전

- React 17.x
- React 18.x
- React 19.x

## 언제 사용하나요

critical-script 의 효용은 두 조건이 동시에 성립할 때 큽니다.

1. **타이밍이 결과를 좌우한다.** 메인 JS 번들이 로드되기 전에 실행되어야 의미가 있는 작업 (API 프리페치, 리소스 프리로드, 웹뷰 브릿지, 스켈레톤 UI 보정 등).
2. **인라인할 코드가 한 줄로 끝나지 않는다.** 어느 정도 로직을 담고 있고, 자주 수정되거나 여러 곳에서 공유됩니다. 이 경우 TypeScript 의 정적 검사·모듈 시스템·IDE 지원이 큰 도움이 됩니다.

(vite 기반 프로젝트일 때만 동작합니다.)

다음과 같다면 굳이 쓸 필요가 없습니다.

- **작업이 메인 JS 번들 이후에 실행돼도 무방하다.** 그럴 땐 일반 번들에 두세요.
- **무거운 로직을 인라인하려 한다.** JS 번들로 분리하는 것이 맞습니다 ([설계 의도](#설계-의도) 참조).
- **인라인 코드가 1-2 줄이고 거의 수정되지 않는다.** `<script>` 태그에 직접 적는 편이 단순합니다.

## 주의사항

- **인라인 스크립트는 HTML 의 일부**입니다. 외부 캐시·CDN 캐시가 적용되지 않으며, HTML 자체의 캐싱 정책에 따라 처리됩니다.
- **최소한의 코드만 인라인하세요**. critical-script 는 **메인 JS 번들이 로드되기 전에 실행되어야 의미가 있는** 작업을 위한 도구입니다. 무거운 로직이나 큰 라이브러리는 일반 JS 번들로 분리해야 도구를 쓰는 의미가 있습니다. `outputSizeLimit` 기본값 8192바이트가 이 원칙을 빌드 단계에서 강제합니다 (자세한 근거는 [API 레퍼런스 > outputSizeLimit](#outputsizelimit) 참조).
- **외부 dependency 는 모두 인라인 번들에 포함**됩니다. `critical.ts` 안에서 import 한 라이브러리가 전부 인라인되므로, 가능하면 vanilla JS 로 작성하는 것이 좋습니다.
- **dev / production 모두 동작**합니다. vite 의 `transformIndexHtml` hook 을 사용하므로 dev server 에서도 동일하게 인라인됩니다.
- **SSR 환경에서는 hydration 영향**을 받습니다. `<CriticalScript />` 컴포넌트는 자동으로 `suppressHydrationWarning` 을 설정합니다.

## 트러블슈팅

**Q. 빌드가 `outputSizeLimit` 초과로 실패합니다.**

`critical.ts` 안의 import 를 줄이거나 코드를 단순화하세요. 큰 라이브러리 의존이 있다면 vanilla JS 로 다시 작성하는 것을 권장합니다. 임계치를 늘리려면 plugin 옵션의 `outputSizeLimit` 값을 조정하되, HTML 전체가 14KB 안에 들어가도록 주의합니다.

**Q. `process.env.X` 가 빌드 후에도 치환되지 않습니다.**

`define` 옵션으로 명시적으로 치환할 값을 정의하세요.

```ts
criticalScriptPlugin({
  define: { 'process.env.API_URL': JSON.stringify('https://api.example.com') },
})
```

**Q. TypeScript 가 `?as-critical-script` import 를 모른다고 에러를 표시합니다.**

[TypeScript 설정](#typescript-설정) 섹션을 따라 `tsconfig.json` 의 `compilerOptions.types` 에 패키지명을 추가하세요.

**Q. dev 모드에서 인라인이 적용되지 않습니다.**

dev / production 모두 동작해야 합니다 ([주의사항](#주의사항) 참조). 적용되지 않으면 vite 버전 확인 + 다른 플러그인과의 hook 순서 충돌을 점검합니다.

## 라이선스

[MIT](LICENSE)
