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
  criticalMissing: string
  documentTitle: Record<DemoVariant, string>
  failed: string
  fetchFailed: string
  home: Pick<DemoHome, 'items' | 'title'>
  requestStart: string
  stage: Record<DemoStage, string>
}

export const DEMO_STRINGS: Record<Locale, DemoStrings> = {
  en: {
    badge: { with: 'critical-script applied', without: 'not applied' },
    contentShown: 'content shown',
    criticalMissing: 'The inline critical script did not run.',
    documentTitle: { with: 'critical-script demo (applied)', without: 'critical-script demo (not applied)' },
    failed: 'failed',
    fetchFailed: 'The demo API did not respond.',
    home: {
      items: ['Rendered from the api/home.json response requested by both demo pages.'],
      title: 'Benchmark test',
    },
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
    criticalMissing: '인라인 critical script가 실행되지 않았습니다.',
    documentTitle: { with: 'critical-script 데모(적용)', without: 'critical-script 데모(미적용)' },
    failed: '실패',
    fetchFailed: '데모 API가 응답하지 않았습니다.',
    home: {
      items: ['두 데모 페이지가 요청한 api/home.json 응답을 렌더링했습니다.'],
      title: '벤치마크 테스트',
    },
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
      "critical-script runs TypeScript at the earliest point in the browser's rendering pipeline at which any code can run. Handling the API calls the first render and paint depend on in that inline script is what gets the screen up sooner.",
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
        after: "The image's URL is in the API response, so the image request starts earlier too.",
        before: "The image's URL is in that response, so the image request starts late too.",
      },
    },
    title: "critical-script in the browser's rendering pipeline",
    toggle: 'Apply critical-script',
  },
  ko: {
    description:
      'critical-script를 사용하면 브라우저 렌더링 파이프라인에서 TypeScript 코드를 가장 빠른 시점에 코드를 실행할 수 있습니다. 최초 렌더링 및 페인트에 필요한 API 호출을 인라인 스크립트로 처리하면 더 빠른 로딩 속도를 얻을 수 있습니다.',
    gain: '{value}% 단축',
    steps: {
      api: {
        after: 'JavaScript 번들 다운로드 및 실행을 기다리지 않는 만큼 응답이 빠르게 도착합니다.',
        before: 'JavaScript 번들 다운로드 및 실행이 늦어지는 만큼 API 요청 및 응답도 늦어집니다.',
      },
      critical: {
        after: 'JavaScript 번들 다운로드 및 실행을 기다리지 않고, 인라인 스크립트에서 바로 API를 호출합니다.',
        before: 'critical-script가 꺼져 있습니다. API를 호출하는 코드는 JavaScript 번들에 있습니다.',
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
   * what the timeline then reports is measured either way.
   */
  conditions: string
  description: string
  lane: Record<DemoLane, string>
  network: string
  networkHint: string
  networkName: Record<Network, string>
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
  stalled: string
  throttleMissing: string
  title: string
}

export const STAGE_STRINGS: Record<Locale, StageStrings> = {
  en: {
    bootWork: 'Bundle startup time',
    bootWorkBrief: 'Bundle startup',
    bootWorkHint:
      'How long the browser spends running the JavaScript bundle once it has downloaded it. It stands in for the time a web application framework such as React spends initializing itself and rendering for the first time.',
    conditions: 'Simulation settings',
    description: 'See how quickly a page loads when critical-script handles the API request.',
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
    panel: { with: 'With critical-script', without: 'Without critical-script' },
    previewIdle: 'not loaded yet',
    previewLoading: 'still loading',
    previewReady: 'finished loading',
    rerun: 'Run again',
    run: 'Run benchmark',
    serverWork: 'Added API latency',
    serverWorkBrief: 'API latency',
    serverWorkHint:
      'Adds the delay a server spends on a call of its own, calling other services or waiting on a database, before it starts sending an answer.',
    running: 'Running…',
    stalled: 'A demo page did not report back. Serve the built output and run it again.',
    throttleMissing:
      'This browser could not register the throttling service worker, so both pages ran against the host at full speed. The lanes below are still measured, but they are far shorter than the chosen conditions would make them.',
    title: 'Benchmark',
  },
  ko: {
    bootWork: 'JavaScript 번들 초기 실행 시간',
    bootWorkBrief: '번들 실행',
    bootWorkHint:
      '브라우저가 JavaScript 번들을 다운로드한 후 실행을 완료하는 시간입니다. React와 같은 웹 앱 프레임워크의 초기화 및 최초 렌더링 시간을 시뮬레이션합니다.',
    conditions: '시뮬레이션 설정',
    description:
      'critical-script를 사용하여 API 요청을 처리하였을 때 웹페이자가 얼마나 빠르게 로딩되는지 확인해보세요.',
    lane: {
      api: 'API 요청',
      critical: 'critical-script 실행',
      document: 'index.html',
      execute: '번들 실행',
      image: '대표 이미지',
      paint: 'Largest Contentful Paint',
      script: 'JavaScript 번들 다운로드',
    },
    network: '네트워크 스로틀링',
    networkHint: '서비스 워커로 느린 네트워크 환경을 시뮬레이션합니다.',
    networkName: { 'fast-4g': '빠른 4G', off: '제한 없음', 'slow-4g': '느린 4G' },
    panel: { with: 'critical-script 적용', without: 'critical-script 미적용' },
    previewIdle: '아직 불러오지 않음',
    previewLoading: '불러오는 중',
    previewReady: '불러오기 완료',
    rerun: '다시 실행',
    run: '벤치마크 실행',
    serverWork: 'API 지연 시간 추가',
    serverWorkBrief: 'API 지연',
    serverWorkHint:
      'API를 호출했을 때 서버에서 다른 서비스를 호출하거나 데이터베이스를 기다리는 데 걸리는 시간을 추가합니다.',
    running: '실행 중…',
    stalled: '데모 페이지가 결과를 보내지 못했습니다. 빌드된 결과물을 서빙한 뒤 다시 실행해 주세요.',
    throttleMissing:
      '이 브라우저에서 스로틀링 서비스 워커를 등록하지 못해 두 페이지가 호스트의 최대 속도로 실행되었습니다. 아래 수치는 여전히 실측값이지만, 선택한 조건에서 예상되는 값보다 훨씬 짧습니다.',
    title: '벤치마크',
  },
}
