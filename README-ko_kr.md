<div align="center">
  <a href="https://github.com/woowabros/critical-script" title="critical-script - React prerender 환경을 위한 인라인 크리티컬 스크립트">
    <img src="./docs/assets/og.png" alt="critical-script — React prerender 환경을 위한 인라인 크리티컬 스크립트" height="400" />
  </a>
  <p>
    <a href="https://github.com/woowabros/critical-script/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
    <a href="https://www.npmjs.com/package/@woowabros/vite-plugin-critical-script"><img src="https://img.shields.io/npm/v/@woowabros/vite-plugin-critical-script?logo=npm" alt="NPM badge" /></a>
    <a href="https://www.npmjs.com/package/@woowabros/vite-plugin-critical-script"><img src="https://img.shields.io/npm/dm/@woowabros/vite-plugin-critical-script?logo=npm" alt="NPM downloads" /></a>
    <a href="https://github.com/woowabros/critical-script"><img src="https://img.shields.io/github/stars/woowabros/critical-script?logo=github" alt="GitHub stars" /></a>
  </p>
</div>

# critical-script

[English](https://github.com/woowabros/critical-script/blob/main/README.md) | 한국어

critical-script 는 React prerender 환경에서 TypeScript 코드를 인라인 `<script>` 태그로 변환해 HTML에 삽입하는 Vite 플러그인입니다. 메인 JavaScript 번들이 로드되기 전에 실행해야 하는 작업을 수행할 수 있습니다.

- `?as-critical-script`를 붙여 import 하면 React 컴포넌트가 생성됩니다. 이 컴포넌트가 빌드 시 HTML로 렌더링되면 인라인 스크립트가 HTML에 삽입됩니다.
- TypeScript 작성을 지원하여 컴파일 시점에 타입 검사를 받을 수 있습니다. esbuild가 컴파일과 minify를 수행해 인라인 스크립트를 작은 크기로 유지합니다.
- [API 프리페치, 리소스 프리로드, 웹뷰 네이티브 브릿지, LCP 최적화](./docs/ko/use-cases.md)처럼 실행 시점이 중요한 작업에 사용할 수 있습니다.
- `outputSizeLimit` 옵션으로 인라인 스크립트 크기를 제한할 수 있습니다. 기본값은 8192바이트이며, 제한을 초과하면 빌드가 실패합니다.
- HTML을 prerender하는 Vite 기반 React 프레임워크에서 사용할 수 있습니다. [react-router](https://github.com/remix-run/react-router) 의 Framework mode 와 [@tanstack/react-start](https://github.com/TanStack/router) 를 지원합니다.
- 배달의민족의 주요 웹뷰 화면에서는 이 API 프리페치 패턴을 적용해 기존 구현보다 LCP(Largest Contentful Paint)를 30~40% 단축했습니다.

## 설치

```bash
npm install -D @woowabros/vite-plugin-critical-script
# 또는
yarn add -D @woowabros/vite-plugin-critical-script
# 또는
pnpm add -D @woowabros/vite-plugin-critical-script
```

## 예시

```ts
// home.critical.ts
performance.mark('critical-start')
window.__home = fetch('/api/home').then((r) => r.json())
```

```tsx
// home.tsx
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

<!-- prettier-ignore -->
```html
<!-- 빌드된 HTML -->
<script data-size="98">(()=>{performance.mark("critical-start");window.__home=fetch("/api/home").then(e=>e.json());})();</script>
```

## 문서

브라우저에서 직접 실행하는 벤치마크를 포함한 전체 문서는
**[https://woowabros.github.io/critical-script/ko](https://woowabros.github.io/critical-script/ko)** 에서 확인할 수 있습니다.

## 기여하기

커뮤니티 구성원 모두의 기여를 환영합니다. [기여 가이드](./CONTRIBUTING-ko_kr.md)에서 개발 프로세스와 버그 수정 및 개선 제안 방법, 변경 사항을 빌드하고 테스트하는 방법을 확인할 수 있습니다.

<a href="https://github.com/woowabros/critical-script/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=woowabros/critical-script" />
</a>

## 라이선스

MIT © Woowabros. 자세한 내용은 [LICENSE](./LICENSE) 를 참고하세요.
