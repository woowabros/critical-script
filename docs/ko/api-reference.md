# API 레퍼런스

## 플러그인 옵션

`criticalScriptPlugin`은 다음과 같은 옵션을 제공합니다:

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `outputSizeLimit` | `number` | `8192` | 컴파일된 인라인 스크립트의 최대 크기(바이트). 초과 시 빌드 실패. |
| `define` | `Record<string, any>` | `{}` | 빌드 시 치환될 전역 상수 (esbuild의 define과 유사). |

### outputSizeLimit

컴파일된 인라인 스크립트의 최대 크기(바이트). 최대 크기 제한을 초과하면 빌드가 실패합니다. 기본값 `8192` 에는 네 가지 의도가 담겨 있습니다.

1. **최초 네트워크 왕복 안에 HTML 전달하기**: [RFC 6928](https://datatracker.ietf.org/doc/html/rfc6928) 기준으로 TCP 초기 혼잡 윈도우(initial congestion window)는 10 세그먼트, 즉 약 14KB 입니다. 압축된 `index.html` 전체가 14KB 안에 들어가면 첫 왕복에서 HTML 이 모두 도착해 초기 렌더링이 빨라집니다. 8192바이트는 HTML 의 나머지 콘텐츠와 합쳐졌을 때도 여유를 둔 값입니다.
2. **본질적 역할 유지**: critical-script 는 **메인 JS 번들보다 먼저 실행되어야 하는 작업을 위한 도구**입니다. 무거운 로직을 인라인 스크립트에 담으면 이 도구를 쓰는 의미가 사라지며, 그런 로직은 일반 JS 번들에 두는 것이 맞습니다. 작은 용량은 이 원칙을 빌드 단계에서 강제하는 장치입니다.
3. **휴먼 에러 검증**: 무심코 큰 라이브러리를 `import` 한 코드가 PR 에 포함되어도 빌드가 실패해 즉시 발견됩니다.
4. **후속 JS 번들 다운로드 지연 방지**: 인라인 스크립트가 클수록 그 뒤에 위치한 `<script src="bundle.js">` 의 다운로드 시작 시점이 늦어집니다. 인라인 코드로 벌어둔 시간이 메인 번들 도착 지연으로 상쇄되면 전체 성능이 오히려 나빠질 수 있습니다.

`outputSizeLimit`은 가능한 한 작은 인라인 스크립트를 유지하도록 유도하기 위한 기본값입니다. 특별한 이유가 없다면 변경하지 않는 것을 권장합니다.


> 14KB 는 TCP MSS(약 1460B) × initcwnd(10) 기준 추정치이며 실제 네트워크 환경에 따라 달라질 수 있습니다. 정확한 수치보다 "**최소한으로 유지하라**" 는 원칙이 더 중요합니다.

### define

빌드 시 치환할 전역 상수를 정의합니다:

```ts
criticalScriptPlugin({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.API_URL': JSON.stringify('https://api.example.com'),
  },
})
```

## Critical Script 컴포넌트 Props

import한 critical script 컴포넌트는 표준 HTML `<script>` 요소의 속성을 모두 지원합니다:

```tsx
<CriticalScript id="my-script" nonce={nonce} />
```

컴포넌트는 자동으로 `suppressHydrationWarning`을 적용하고, 스크립트 크기를 나타내는 `data-size` 속성을 함께 붙입니다.

## 호환성

### 프레임워크 지원

| 프레임워크 | 패키지 | 지원 버전 |
|-----------|--------|----------|
| vite | `@woowabros/vite-plugin-critical-script` | 5.x |
| [react-router](https://github.com/remix-run/react-router) | `@woowabros/vite-plugin-critical-script` | 7.x |
| [@tanstack/react-start](https://github.com/TanStack/router) | `@woowabros/vite-plugin-critical-script` | 1.x |

### React 버전

- 17.x
- 18.x
- 19.x
