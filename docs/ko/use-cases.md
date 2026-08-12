---
title: 활용 사례
description: API 프리페치와 리소스 프리로드, 웹뷰 네이티브 브리지 등 critcal-script의 활용 사례를 소개합니다.
sidebar:
  order: 3
---

critical-script가 인라인된 스크립트는 메인 JS 번들이 다운로드되고 파싱되기 전에 실행됩니다.  
따라서 메인 JS 번들이 실행되기 전에 시작해야 효과가 있는 작업에 활용할 수 있습니다.

## API 프리페치

HTML을 파싱하는 동안 API 요청을 미리 시작하고, 애플리케이션이 실행된 후 응답을 사용합니다.

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

배달의민족의 주요 웹뷰 화면에서는 이 API 프리페치 패턴을 적용해 기존 구현보다 LCP(Largest Contentful Paint)를 30~40% 단축했습니다.

## 런타임에 결정되는 리소스 프리로드

API 응답으로 받은 LCP 이미지 URL을 사용해 `<link rel="preload">`를 동적으로 삽입할 수 있습니다.

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

하이브리드 앱 환경에서 React가 렌더링되기 전에 네이티브 코드가 전달한 값을 읽어 초기 UI에 반영할 수 있습니다.  
예를 들어 iOS의 홈 인디케이터나 하단 고정 영역에 필요한 안전 영역(safe area) 값을 미리 적용하여 화면이 렌더링된 후 UI가 깜빡이는 현상을 줄일 수 있습니다.

```ts
// home.critical.ts
const inset = window.AppBridge?.getSafeAreaInsets?.()
if (inset) {
  document.documentElement.style.setProperty('--inset-bottom', `${inset.bottom}px`)
}
```
