<div align="center">
  <a href="https://github.com/woowabros/critical-script" title="critical-script - React prerender 환경을 위한 인라인 크리티컬 스크립트">
    <img src="./docs/public/og.png" alt="critical-script — React prerender 환경을 위한 인라인 크리티컬 스크립트" height="400" />
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

critical-script 는 React prerender 환경에서 TypeScript 코드를 인라인 `<script>` 태그로 만들어 HTML 에 삽입하는 vite 플러그인입니다. 메인 JavaScript 번들이 로드되기 전에 크리티컬한 작업을 실행할 수 있습니다.

- `?as-critical-script` 로 import 하면 React 컴포넌트가 생성됩니다. 이 컴포넌트가 빌드 시 HTML로 렌더링될 때 인라인 스크립트가 삽입됩니다.
- TypeScript 로 작성하면 컴파일 시점에 타입 검사를 거칩니다. esbuild 가 컴파일과 minify 를 처리해 인라인 스크립트를 최소 크기로 유지합니다.
- [API 프리페치, 리소스 프리로드, 웹뷰 네이티브 브릿지, LCP 최적화](./docs/ko/use-cases.md)처럼 실행 타이밍이 결과를 좌우하는 작업을 위한 도구입니다.
- `outputSizeLimit` 옵션으로 인라인 스크립트 크기를 제한할 수 있습니다. 기본값은 8192바이트이며, 이를 초과하면 빌드가 실패합니다.
- HTML을 prerender하는 Vite 기반 React 프레임워크에서 사용할 수 있습니다. [react-router](https://github.com/remix-run/react-router) 의 framework mode 와 [@tanstack/react-start](https://github.com/TanStack/router) 를 지원합니다.
- 배달의민족 앱에서 실제로 사용되고 있습니다. B마트와 배민스토어 웹뷰에서는 API Prefetch 패턴을 적용해 LCP를 30~40% 개선했습니다.

## 설치

```bash
npm install -D @woowabros/vite-plugin-critical-script
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

```html
<!-- 빌드된 HTML -->
<script data-size="95">
  ;(() => {
    performance.mark('critical-start')
    window.__home = fetch('/api/home').then((r) => r.json())
  })()
</script>
```

## 문서

브라우저에서 직접 실행하는 벤치마크를 포함한 전체 문서는
**<https://woowabros.github.io/critical-script/>** 에 게시되어 있습니다.

- [시작하기](./docs/ko/getting-started.md): 설치 방법, 사용법, 출력 예시, TypeScript 설정을 확인할 수 있습니다.
- [설계 원칙](./docs/ko/design-philosophy.md): 인라인 스크립트에 무엇을 담아야 하는지, 언제 이 플러그인을 쓰는지 설명합니다.
- [활용 사례](./docs/ko/use-cases.md): API Prefech, 리소스 프리로드, 웹뷰 네이티브 브릿지, LCP 최적화 사례를 담았습니다.
- [API 레퍼런스](./docs/ko/api-reference.md): 플러그인 옵션과 컴포넌트 props, 호환성 정보를 정리했습니다.
- [주의사항 & 트러블슈팅](./docs/ko/caveats.md): 미리 알아둘 점과 자주 겪는 문제의 해결 방법을 모았습니다.

## 기여하기

커뮤니티의 모든 분들의 기여를 환영합니다. [기여 가이드](./CONTRIBUTING.md)에서 개발 프로세스와 버그 수정 및 개선 제안 방법, 변경 사항을 빌드하고 테스트하는 절차를 확인하세요.

<a href="https://github.com/woowabros/critical-script/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=woowabros/critical-script" />
</a>

## 라이선스

MIT © Woowabros. 자세한 내용은 [LICENSE](./LICENSE) 를 참고하세요.
