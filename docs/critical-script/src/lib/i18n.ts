import type { DemoLane, DemoStage, DemoVariant, Network } from './demo'
/**
 * The two states the landing chart slides between, and the lanes it numbers as steps. Declared
 * here because the strings below are keyed by them; the order the steps are drawn in belongs to
 * the chart, in components/Showcase.
 */
export type ShowcaseState = 'after' | 'before'

export type ShowcaseStep = 'api' | 'critical' | 'image'

export type Locale = 'en' | 'ko'

export const LOCALES: readonly Locale[] = ['en', 'ko']

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'ko'
}

/** Strings rendered inside the demo iframes. */
export interface DemoStrings {
  badge: Record<DemoVariant, string>
  contentShown: string
  failed: string
  requestStart: string
  stage: Record<DemoStage, string>
}

export const DEMO_STRINGS: Record<Locale, DemoStrings> = {
  en: {
    badge: { with: 'critical-script applied', without: 'not applied' },
    contentShown: 'content shown',
    failed: 'failed',
    requestStart: 'request start',
    stage: {
      booting: 'waiting for the app bundle',
      idle: 'starting',
      ready: 'content ready',
      requesting: 'request in flight',
    },
  },
  ko: {
    badge: { with: 'critical-script 적용', without: '미적용' },
    contentShown: '화면 표시',
    failed: '실패',
    requestStart: '요청 시작',
    stage: {
      booting: '앱 번들 대기 중',
      idle: '시작',
      ready: '표시 완료',
      requesting: '요청 진행 중',
    },
  },
}

/** Strings for the fixed chart on the landing page. */
export interface ShowcaseStrings {
  description: string
  /** Written across the room the paint no longer takes. `{value}` is the figure. */
  gain: string
  /**
   * What happens at each numbered mark on the chart, keyed by the lane it sits on and by
   * whether the plugin is applied. Each step reads differently in the two states: the same
   * three things happen either way, in a different order and at a different time.
   */
  steps: Record<ShowcaseStep, Record<ShowcaseState, string>>
  title: string
  /** Labels the checkbox that applies the plugin to the chart. */
  toggle: string
}

export const SHOWCASE_STRINGS: Record<Locale, ShowcaseStrings> = {
  en: {
    description:
      "critical-script lets code run at the earliest point in the browser's rendering pipeline at which JavaScript can run at all. Handling the API calls that the first render and paint depend on there is what makes the screen arrive sooner.",
    gain: '{value}% faster',
    steps: {
      api: {
        after: 'The response lands earlier by as much as the bundle would have taken to download and run.',
        before: 'The API request and its response are late by as much as the bundle takes to download and run.',
      },
      critical: {
        after: 'The inline script calls the API without waiting for the JavaScript bundle to download and run.',
        before: 'critical-script is off. The code that calls the API sits in the JavaScript bundle.',
      },
      image: {
        after: "The image's URL is in the API response, so the image request comes forward with it.",
        before: "The image's URL is in that response, so the image request is late as well.",
      },
    },
    title: "critical-script in the browser's rendering pipeline",
    toggle: 'Apply critical-script',
  },
  ko: {
    description:
      'critical-script를 사용하면 브라우저 렌더링 파이프라인에서 JavaScript를 가장 빠르게 실행할 수 있는 시점에 코드를 실행할 수 있습니다. 최초 렌더링 및 페인트에 필요한 API 호출을 critical-script에서 처리하면 더 빠른 로딩 속도를 얻을 수 있습니다.',
    gain: '{value}% 감소',
    steps: {
      api: {
        after: 'JavaScript 번들 다운로드 및 실행을 기다리지 않는 만큼 응답이 빠르게 도착합니다.',
        before: 'JavaScript 번들 다운로드 및 실행이 늦어지는 만큼 API 요청 및 응답도 늦어집니다.',
      },
      critical: {
        after: 'JavaScript 번들 다운로드 및 실행을 기다리지 않고, 인라인 스크립트에서 바로 API를 호출합니다.',
        before: 'critical-script가 꺼져있습니다. API를 호출하는 코드는 JavaScript 번들에 있습니다.',
      },
      image: {
        after: '대표 이미지의 URL은 API 응답에 있으므로, 이미지 요청도 함께 앞당겨집니다.',
        before: '대표 이미지의 URL이 API 응답에 있어서 이미지 요청 또한 늦어집니다.',
      },
    },
    title: '브라우저 렌더링 파이프라인에서의 critical-script',
    toggle: 'critical-script 적용',
  },
}

/**
 * Strings for the benchmark. `title` and `description` are read by the section on the landing
 * page; the benchmark's own page states the same two in its frontmatter, which Starlight needs
 * as literal text for the heading, the sidebar, and the page title.
 */
export interface StageStrings {
  bootWork: string
  /** For the closed summary, where the full name of a setting would run the line long. */
  bootWorkBrief: string
  bootWorkHint: string
  /**
   * Names the group of settings a run is carried out under, which starts out closed. What
   * these settings do is simulate a slow connection, a busy server and a heavy framework;
   * what the timeline then reports is measured, which is what `simulationTitle` explains.
   */
  conditions: string
  description: string
  lane: Record<DemoLane, string>
  network: string
  networkHint: string
  networkName: Record<Network, string>
  notes: string[]
  panel: Record<DemoVariant, string>
  /** Read out for the small preview beside each case, which is otherwise just a colour. */
  previewIdle: string
  previewLoading: string
  previewReady: string
  rerun: string
  run: string
  running: string
  serverWork: string
  serverWorkBrief: string
  serverWorkHint: string
  simulationTitle: string
  stalled: string
  throttleMissing: string
  title: string
}

export const STAGE_STRINGS: Record<Locale, StageStrings> = {
  en: {
    bootWork: 'Bundle startup time',
    bootWorkBrief: 'Bundle startup',
    bootWorkHint:
      'How long the browser spends running the JavaScript bundle once it has downloaded it. It stands in for what a web application framework such as React spends initialising itself and rendering for the first time.',
    conditions: 'Simulation settings',
    description:
      'Compares the same screen before and after critical-script moves the API call earlier. A service worker throttles the connection, so both pages load under something close to production conditions.',
    lane: {
      api: 'API request',
      critical: 'critical-script runs',
      document: 'index.html',
      execute: 'Bundle execution',
      image: 'Hero image',
      paint: 'Largest Contentful Paint',
      script: 'JavaScript bundle download',
    },
    network: 'Network throttling',
    networkHint: 'A service worker stands in for a slow connection.',
    networkName: { 'fast-4g': 'Fast 4G', off: 'No throttling', 'slow-4g': 'Slow 4G' },
    notes: [
      'Every number on this page comes from a browser timing API: Navigation Timing for the document, Resource Timing for each request, and the largest contentful paint observer for the marker. Nothing is estimated.',
      'The conditions are real. A service worker holds each response back for one round trip and then hands the body over at the chosen rate, the way the throttling in browser developer tools does, so the browser times them like any other slow request. Pick no throttling to see this host at full speed.',
      "It shapes the connection, not the clock: a round trip costs the same whichever request pays it, which is why the page that asks earlier finishes earlier. The server work is added to that same wait, because from the browser's side a server thinking and a slow network are the same thing.",
      'Framework startup is the bundle holding the page up, not the network: the file has arrived and the page still cannot act. The bundle itself decides when it is ready, so waiting on it is a real dependency rather than a pause the page chose to take.',
      'The worker only stands between the demo pages and the network. It stores nothing, and it is registered while this page is open and taken back off when you leave.',
      'The inline script is a build artifact, so these pages only behave this way in the built output, never in a client-only render.',
    ],
    panel: { with: 'With critical-script', without: 'Without critical-script' },
    previewIdle: 'not loaded yet',
    previewLoading: 'still loading',
    previewReady: 'finished loading',
    rerun: 'Run again',
    run: 'Run the demo',
    serverWork: 'Added API latency',
    serverWorkBrief: 'API latency',
    serverWorkHint:
      'Adds the delay a server spends on a call of its own, calling other services or waiting on a database, before it starts sending an answer.',
    running: 'Running…',
    simulationTitle: 'How this is measured',
    stalled: 'A demo page did not report back. Serve the built output and run it again.',
    throttleMissing:
      'This browser would not take the throttling worker, so both pages ran against the host at full speed. The lanes below are still measured, but they are far shorter than the chosen conditions would make them.',
    title: 'The critical-script demo',
  },
  ko: {
    bootWork: 'JavaScript 번들 초기 실행 시간',
    bootWorkBrief: '번들 실행',
    bootWorkHint:
      '브라우저가 JavaScript 번들을 다운로드한 후 실행을 완료하는 시간입니다. React와 같은 웹 앱 프레임워크가 초기화 및 최초 렌더링을 수행하는 시간을 시뮬레이션합니다.',
    conditions: '시뮬레이션 설정',
    description:
      'critical-script 를 사용한 API 호출 시점 최적화를 적용하기 전과 후의 차이를 비교합니다. Service Worker 를 사용한 쓰로틀링을 통해 프로덕션과 유사한 환경을 시뮬레이션합니다.',
    lane: {
      api: 'API 요청',
      critical: 'critical-script 실행',
      document: 'index.html',
      execute: '번들 실행',
      image: '대표 이미지',
      paint: 'Largest Contentful Paint',
      script: 'JavaScript 번들 다운로드',
    },
    network: '네트워크 쓰로틀링',
    networkHint: 'Service Worker 를 사용하여 느린 네트워크 환경을 시뮬레이션합니다.',
    networkName: { 'fast-4g': 'Fast 4G', off: '제한 없음', 'slow-4g': 'Slow 4G' },
    notes: [
      '이 화면의 모든 수치는 브라우저의 타이밍 API 에서 읽은 값입니다. 문서는 Navigation Timing, 각 요청은 Resource Timing, 페인트 마커는 Largest Contentful Paint 옵저버에서 가져옵니다. 추정한 값은 없습니다.',
      '네트워크 조건은 실제로 걸립니다. 서비스 워커가 응답마다 왕복 시간만큼 붙잡아 둔 뒤 지정한 속도로 본문을 넘겨주며, 브라우저 개발자 도구의 네트워크 스로틀링과 같은 방식입니다. 그래서 브라우저가 다른 느린 요청과 똑같이 잽니다. 제한 없음을 고르면 이 호스트의 전속력을 볼 수 있습니다.',
      '시계가 아니라 회선을 조입니다. 왕복 시간은 어느 요청이 치르든 같기 때문에, 먼저 요청한 페이지가 먼저 끝납니다. API 지연 시간도 같은 대기에 더해집니다. 브라우저 입장에서는 서버가 계산하는 것과 네트워크가 느린 것이 구별되지 않습니다.',
      '프레임워크 초기화는 네트워크가 아니라 번들이 페이지를 붙잡는 시간입니다. 파일은 이미 도착했는데도 페이지가 일을 시작할 수 없는 구간입니다. 준비 완료를 번들이 직접 알리므로, 이를 기다리는 것은 페이지가 임의로 쉬는 것이 아니라 실제 의존 관계입니다.',
      '워커는 데모 페이지와 네트워크 사이에만 끼어듭니다. 아무것도 저장하지 않으며, 이 페이지를 여는 동안 등록했다가 떠날 때 해제합니다.',
      '인라인 스크립트는 빌드 산출물이므로, 이 동작은 빌드된 결과에서만 나타나고 클라이언트에서만 렌더링하는 환경에서는 나타나지 않습니다.',
    ],
    panel: { with: 'critical-script 사용', without: 'critical-script 미사용' },
    previewIdle: '아직 불러오지 않음',
    previewLoading: '불러오는 중',
    previewReady: '불러오기 완료',
    rerun: '다시 실행',
    run: '데모 실행',
    serverWork: 'API 지연 시간 추가',
    serverWorkBrief: 'API 지연',
    serverWorkHint:
      'API 를 호출했을 때 서버 측에서 다른 서비스를 호출하거나 데이터베이스를 기다리는 시간을 고려한 지연 시간을 추가합니다.',
    running: '실행 중…',
    simulationTitle: '측정 방법',
    stalled: '데모 페이지가 결과를 보내지 못했습니다. 빌드된 결과물을 서빙한 뒤 다시 실행해 주세요.',
    throttleMissing:
      '이 브라우저가 스로틀링 워커를 받아들이지 않아, 두 페이지가 호스트의 전속력으로 실행되었습니다. 아래 수치는 여전히 실측이지만, 고른 조건에서 나올 값보다 훨씬 짧습니다.',
    title: 'critical-script 적용 데모',
  },
}
