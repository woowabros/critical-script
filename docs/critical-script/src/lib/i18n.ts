import type { DemoStage, DemoVariant } from './demo'

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
    badge: { with: 'inline critical script', without: 'no inline script' },
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
    badge: { with: '인라인 크리티컬 스크립트', without: '인라인 스크립트 없음' },
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

/** Strings for the standalone benchmark page. */
export interface StageStrings {
  backToDocs: string
  boot: string
  bootHint: string
  contentShown: string
  description: string
  faster: string
  idle: string
  latency: string
  latencyHint: string
  legendNetwork: string
  legendWait: string
  notes: string[]
  openInTab: string
  panel: Record<DemoVariant, string>
  panelHint: Record<DemoVariant, string>
  requestStart: string
  rerun: string
  run: string
  running: string
  simulationTitle: string
  stalled: string
  timelineTitle: string
  title: string
}

export const STAGE_STRINGS: Record<Locale, StageStrings> = {
  en: {
    backToDocs: 'Documentation',
    boot: 'App bundle boot',
    bootHint: 'How long the page waits for its JavaScript bundle before it can start any work.',
    contentShown: 'Content shown',
    description:
      'Two pages built by this plugin, loaded side by side. They render the same screen from the same file. Only the left one has to wait for its JavaScript bundle before it can even ask for the data.',
    faster: 'faster',
    idle: 'Press run to load both pages at the same moment.',
    latency: 'API latency',
    latencyHint: 'How long the server takes to answer. Both pages talk to the same simulated server.',
    legendNetwork: 'request in flight',
    legendWait: 'waiting for the bundle',
    notes: [
      'Request start is measured, not simulated. It comes from the Resource Timing API inside each page, and it is where the plugin does its work.',
      'Bundle boot and API latency are simulated with timers, because GitHub Pages serves static files and cannot be made slow on purpose. Set both to zero to see the raw numbers.',
      'The inline script is a build artifact, so these pages only behave this way in the built output, never in a client-only render.',
    ],
    openInTab: 'Open this page on its own',
    panel: { with: 'With critical script', without: 'Without critical script' },
    panelHint: {
      with: 'The inline script sends the request while the HTML is still being parsed.',
      without: 'The request starts in useEffect, after the bundle has booted.',
    },
    requestStart: 'Request start',
    rerun: 'Run again',
    run: 'Run both',
    running: 'Running…',
    simulationTitle: 'Simulation',
    stalled: 'A demo page did not report back. Serve the built output and run it again.',
    timelineTitle: 'Timeline',
    title: 'See the difference',
  },
  ko: {
    backToDocs: '문서',
    boot: '앱 번들 부팅',
    bootHint: '페이지가 자바스크립트 번들을 기다리느라 아무 일도 시작하지 못하는 시간입니다.',
    contentShown: '화면 표시',
    description:
      '이 플러그인으로 빌드한 두 페이지를 나란히 불러옵니다. 같은 파일로 같은 화면을 그리며, 왼쪽만 데이터를 요청하기 전에 자바스크립트 번들을 기다립니다.',
    faster: '더 빠름',
    idle: '실행을 누르면 두 페이지를 같은 순간에 불러옵니다.',
    latency: 'API 지연',
    latencyHint: '서버가 응답하기까지 걸리는 시간입니다. 두 페이지가 같은 조건의 서버를 사용합니다.',
    legendNetwork: '요청 진행',
    legendWait: '번들 대기',
    notes: [
      '요청 시작은 시뮬레이션이 아니라 실측값입니다. 각 페이지 안에서 Resource Timing API 로 읽은 값이며, 플러그인이 실제로 개선하는 지점입니다.',
      '번들 부팅과 API 지연은 타이머로 시뮬레이션합니다. GitHub Pages 는 정적 파일을 제공하므로 응답을 일부러 늦출 수 없습니다. 두 값을 0 으로 두면 조건 없는 수치를 볼 수 있습니다.',
      '인라인 스크립트는 빌드 산출물이므로, 이 동작은 빌드된 결과에서만 나타나고 클라이언트에서만 렌더링하는 환경에서는 나타나지 않습니다.',
    ],
    openInTab: '이 페이지만 따로 열기',
    panel: { with: '크리티컬 스크립트 사용', without: '크리티컬 스크립트 미사용' },
    panelHint: {
      with: '인라인 스크립트가 HTML 을 파싱하는 동안 요청을 보냅니다.',
      without: '번들 부팅이 끝난 뒤 useEffect 에서 요청을 시작합니다.',
    },
    requestStart: '요청 시작',
    rerun: '다시 실행',
    run: '두 페이지 실행',
    running: '실행 중…',
    simulationTitle: '시뮬레이션',
    stalled: '데모 페이지가 결과를 보내지 못했습니다. 빌드된 결과물을 서빙한 뒤 다시 실행해 주세요.',
    timelineTitle: '타임라인',
    title: '차이를 눈으로 확인하기',
  },
}
