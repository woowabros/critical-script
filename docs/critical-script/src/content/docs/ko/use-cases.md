---
title: 활용 사례
description: API 프리페치와 리소스 프리로드, 웹뷰 네이티브 브릿지, LCP 최적화 사례를 다룹니다.
sidebar:
  order: 3
---

크리티컬 스크립트는 메인 JS 번들이 다운로드·파싱되기 *전에* 실행됩니다. 이 타이밍은 다음과 같은 작업에 유용합니다.

## API 프리페치

HTML이 파싱될 때 요청을 시작해두고, 앱이 실행된 뒤 응답을 받아 씁니다:

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

## 런타임에 결정되는 리소스 프리로드

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

## 웹뷰 네이티브 브릿지

하이브리드 앱 환경에서 React가 렌더되기 전에 네이티브가 넘긴 값을 읽어와, 스켈레톤 UI를 디바이스 상태에 맞춰 깜빡임 없이 표시합니다. iOS 의 홈 인디케이터·하단 고정 영역처럼 하단 safe-area 보정에 자주 쓰입니다:

```ts
// home.critical.ts
const inset = window.AppBridge?.getSafeAreaInsets?.()
if (inset) {
  document.documentElement.style.setProperty('--inset-bottom', `${inset.bottom}px`)
}
```

## LCP 최적화 (사례)

API Prefetch 패턴은 배달의민족 앱의 다양한 웹뷰 지면에서 성능 최적화에 사용되고 있습니다. 대표적으로 B마트와 배민스토어 서비스에서는 적용 전 대비 LCP(Largest Contentful Paint)가 30~40% 개선되었습니다.
