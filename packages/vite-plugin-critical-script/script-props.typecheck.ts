import type CriticalScript from './__fixtures__/sample.ts?as-critical-script'

void ({ async: true } satisfies React.ComponentProps<typeof CriticalScript>)
