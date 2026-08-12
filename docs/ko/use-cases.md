---
title: 활용 사례
description: API 프리페치와 리소스 프리로드, 웹뷰 네이티브 브리지, LCP 시간 단축 사례를 다룹니다.
sidebar:
  order: 3
---

critical-script가 인라인한 스크립트는 메인 JS 번들이 다운로드·파싱되기 *전에* 실행됩니다. 이 시점은 다음과 같은 작업에 유용합니다.

## API 프리페치

HTML을 파싱할 때 요청을 시작해 두고, 앱이 실행된 뒤 응답을 사용합니다.

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

배달의민족 주요 웹뷰 지면에서는 이 API 프리페치 패턴으로 기존 구현 대비 LCP(Largest Contentful Paint) 시간을 30~40% 단축했습니다.

## 런타임에 결정되는 리소스 프리로드

API 응답에서 LCP 이미지 URL을 받아 곧바로 `<link rel="preload">`를 삽입합니다.

```ts
// home.critical.ts
void (async () => {
  const response = await fetch('/api/home')
  const data = await response.json()
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = data.heroImageUrl
  document.head.appendChild(link)
})()
```

## 웹뷰 네이티브 브리지

하이브리드 앱 환경에서 React가 렌더링되기 전에 네이티브 코드가 전달한 값을 읽어, 스켈레톤 UI를 기기 상태에 맞게 깜빡임 없이 표시합니다. iOS의 홈 인디케이터나 하단 고정 영역을 위한 안전 영역(safe area) 보정에 자주 사용합니다.

```ts
// home.critical.ts
const inset = window.AppBridge?.getSafeAreaInsets?.()
if (inset) {
  document.documentElement.style.setProperty('--inset-bottom', `${inset.bottom}px`)
}
```
