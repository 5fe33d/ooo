/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEPOLIA_RPC: string
  readonly VITE_LIDO_CONTRACT: string
  readonly VITE_UNISWAP_ROUTER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
