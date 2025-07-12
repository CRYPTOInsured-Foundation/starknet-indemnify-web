declare module 'vite-plugin-next' {
    import { Plugin } from 'vite'
    export default function next(options?: {
      pnpm?: boolean
      reactStrictMode?: boolean
    }): Plugin
  }