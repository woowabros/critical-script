---
title: 주의사항 & 트러블슈팅
description: 사용 전에 알아둘 제약과 자주 겪는 문제의 해결 방법을 정리합니다.
sidebar:
  order: 4
---

## 주의사항

- **인라인 스크립트는 HTML의 일부**입니다. 외부 리소스 및 CDN 캐싱은 적용되지 않으며, HTML 자체의 캐싱 정책을 따릅니다.
- **최소한의 코드만 포함하세요**. critical-script는 **메인 JS 번들보다 먼저 실행되어야 하는 작업을 위한 도구**입니다. 무거운 로직은 일반 JS 번들에 두세요. `outputSizeLimit` 기본값인 8192바이트가 이 원칙을 빌드 단계에서 강제합니다. 자세한 근거는 [API 레퍼런스 > outputSizeLimit](./api-reference.md#outputsizelimit)를 참조하세요.
- **외부 의존성을 import하면 인라인 스크립트의 크기가 커집니다.** `critical.ts`에서 import한 라이브러리는 모두 인라인 번들에 포함되므로, 가능하면 바닐라 JavaScript로 작성하는 것이 좋습니다.
- **인라인 스크립트는 HTML로 렌더링되어야 남습니다**. 가져온 컴포넌트가 React 렌더링 과정에서 `<script>` 태그를 만들기 때문에, 빌드 시점이나 서버에서 HTML을 생성하는 환경에서 의미가 있습니다. 프레임워크 모드의 [react-router](https://github.com/remix-run/react-router)와 [@tanstack/react-start](https://github.com/TanStack/router)가 그런 환경입니다.
- **SSR 환경에서는 하이드레이션 과정에서 불일치가 발생**할 수 있습니다. `<CriticalScript />` 컴포넌트는 `suppressHydrationWarning`을 자동으로 설정합니다.

## 트러블슈팅

**Q. 빌드가 `outputSizeLimit` 초과로 실패합니다.**

`critical.ts`의 import를 줄이거나 코드를 단순화하세요. 큰 라이브러리 의존성이 있다면 바닐라 JavaScript로 다시 작성하는 것을 권장합니다. 임계치를 늘리려면 플러그인 옵션의 `outputSizeLimit` 값을 조정하세요. 다만 인라인 스크립트는 HTML에 포함되어 요청마다 전송되므로, 임계치를 늘리더라도 가능한 한 작게 유지하는 것이 좋습니다.

**Q. `process.env.X`가 빌드 후에도 치환되지 않습니다.**

`define` 옵션을 사용해 치환할 값을 명시적으로 정의하세요.

```ts
criticalScriptPlugin({
  define: { 'process.env.API_URL': JSON.stringify('https://api.example.com') },
})
```

**Q. TypeScript가 `?as-critical-script` import를 인식하지 못합니다.**

[TypeScript 설정](./getting-started.md#typescript-설정)에 따라 `tsconfig.json`의 `compilerOptions.types`에 패키지 이름을 추가하세요.

**Q. 페이지에 인라인 스크립트가 보이지 않습니다.**

해당 페이지가 클라이언트 사이드에서만 렌더링되는지 확인하세요. 인라인 스크립트는 빌드 시점이나 서버에서 HTML로 렌더링되는 페이지에만 포함됩니다. SSR로 렌더링하는 개발 서버에서도 스크립트가 나타납니다. 보이지 않는다면 Vite 버전과 다른 플러그인과의 훅 실행 순서가 충돌하는지 확인하세요.
