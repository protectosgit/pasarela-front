/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_DEBUG: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  readonly [key: `VITE_${string}`]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  
  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(container: Element | Document, initialChildren: ReactNode): Root;
}

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}
