import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

export function mount(rootEl: HTMLElement) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

export { App } from './App'
