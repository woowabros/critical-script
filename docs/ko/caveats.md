# 주의사항 & 트러블슈팅

## 주의사항

- **인라인 스크립트는 HTML 의 일부**입니다. 외부 리소스 및 CDN 캐싱은 적용되지 않으며, HTML 자체의 캐싱 정책을 따릅니다.
- **최소한의 코드만 포함하세요**. critical-script 는 **메인 JS 번들보다 먼저 실행되어야 하는 작업을 위한 도구**입니다. 무거운 로직을 인라인 스크립트에 담으면 이 도구를 쓰는 의미가 사라지며, 그런 로직은 일반 JS 번들에 두는 것이 맞습니다. 작은 용량은 이 원칙을 빌드 단계에서 강제하는 장치입니다. `outputSizeLimit` 기본값 8192바이트가 이 원칙을 빌드 단계에서 강제합니다 (자세한 근거는 [API 레퍼런스 > outputSizeLimit](./api-reference.md#outputsizelimit) 참조).
- **외부 dependency 는 모두 인라인 번들에 포함**됩니다. `critical.ts` 안에서 import 한 라이브러리가 전부 인라인되므로, 가능하면 vanilla JS 로 작성하는 것이 좋습니다.
- **dev / production 모두 동작**합니다. vite 의 `transformIndexHtml` hook 을 사용하므로 dev server 에서도 동일하게 인라인됩니다.
- **SSR 환경에서는 hydration 동작에서 발생**할 수 있는 불일치를 고려해야 합니다. `<CriticalScript />` 컴포넌트는  `suppressHydrationWarning` 을 자동으로 설정합니다.

## 트러블슈팅

**Q. 빌드가 `outputSizeLimit` 초과로 실패합니다.**

`critical.ts` 안의 import 를 줄이거나 코드를 단순화하세요. 큰 라이브러리 의존이 있다면 vanilla JS로 다시 작성하는 것을 권장합니다. 임계치를 늘리려면 plugin 옵션의 `outputSizeLimit` 값을 조정하되, HTML 전체가 14KB 안에 들어가도록 주의합니다.

**Q. `process.env.X` 가 빌드 후에도 치환되지 않습니다.**

`define` 옵션을 사용해 치환할 값을 명시적으로 정의하세요.

```ts
criticalScriptPlugin({
  define: { 'process.env.API_URL': JSON.stringify('https://api.example.com') },
})
```

**Q. TypeScript 가 `?as-critical-script` import 를 모른다고 에러를 표시합니다.**

[TypeScript 설정](./getting-started.md#typescript-설정) 섹션을 따라 `tsconfig.json` 의 `compilerOptions.types` 에 패키지명을 추가하세요.

**Q. dev 모드에서 인라인이 적용되지 않습니다.**

dev / production 모두 동작해야 합니다 ([주의사항](#주의사항) 참조). 적용되지 않으면 vite 버전 확인하고 다른 플러그인과의 hook 실행 순서 충돌 여부를 확인합니다.
