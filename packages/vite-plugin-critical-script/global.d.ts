declare module '*?as-critical-script' {
  import 'react/jsx-runtime'

  interface CriticalScriptProps extends React.HTMLAttributes<HTMLScriptElement> {}

  /**
   * When rendering HTML with React via SSR or SSG in Vite, JS script code is inlined inside the head.
   *
   * ```html
   * <html>
   * <head>
   *   <script>
   *     <!-- critical script code generated here -->
   *   </script>
   * </head>
   * </html>
   * ```
   *
   * ```tsx
   * import CriticalScript from './critical.ts?as-critical-script'
   *
   * export default function () {
   *   return (
   *     <>
   *       <CriticalScript />
   *       <HomePage />
   *     </>
   *   )
   * }
   * ```
   */

  const CriticalScriptComponent: React.FC<CriticalScriptProps>
  export default CriticalScriptComponent
}
