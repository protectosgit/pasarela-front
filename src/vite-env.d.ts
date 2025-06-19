/// <reference types="vite/client" />

// Definiciones de variables de entorno específicas de la aplicación
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_DEBUG: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declaraciones globales para Wompi
declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}
