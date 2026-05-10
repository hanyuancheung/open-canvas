import { useEffect, useMemo, useState } from 'react'
import boards from 'virtual:open-canvas/boards'
import config from 'virtual:open-canvas/config'
import type { BoardModule } from '../types'
import { BoardViewer } from './BoardViewer'
import { PresentMode } from './PresentMode'
import { Home } from './Home'

/**
 * 极简 hash router：避免引入 react-router 依赖。
 * 路由：
 *   #/                        -> Home
 *   #/<board>                 -> BoardViewer (自由漫游)
 *   #/<board>/present[?step=] -> PresentMode
 */
type Route =
  | { kind: 'home' }
  | { kind: 'board'; id: string }
  | { kind: 'present'; id: string; step: number; print: boolean }

function parseRoute(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart] = raw.split('?')
  const segs = (pathPart ?? '').split('/').filter(Boolean)
  const params = new URLSearchParams(queryPart ?? '')
  if (segs.length === 0) return { kind: 'home' }
  if (segs.length === 1) return { kind: 'board', id: segs[0]! }
  if (segs[1] === 'present')
    return {
      kind: 'present',
      id: segs[0]!,
      step: Math.max(0, Number(params.get('step') ?? 0) || 0),
      print: params.get('print') === '1',
    }
  return { kind: 'board', id: segs[0]! }
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute())
  useEffect(() => {
    const onHash = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.title = config.title ?? 'open-canvas'
  }, [])

  const ids = useMemo(() => Object.keys(boards).sort(), [])

  if (route.kind === 'home') return <Home boardIds={ids} />

  return <BoardLoader id={route.id} route={route} />
}

function BoardLoader({ id, route }: { id: string; route: Exclude<Route, { kind: 'home' }> }) {
  const [board, setBoard] = useState<BoardModule | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    setBoard(null)
    setError(null)
    const loader = boards[id]
    if (!loader) {
      setError(`Board "${id}" not found.`)
      return
    }
    let cancelled = false
    loader().then(
      (mod) => {
        if (!cancelled) setBoard(mod.default)
      },
      (e) => {
        if (!cancelled) setError(String(e))
      },
    )
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui', color: '#b91c1c' }}>
        {error}
        {' — '}
        <a href="#/">Home</a>
      </div>
    )
  }
  if (!board) return <div style={{ padding: 24, fontFamily: 'system-ui' }}>Loading…</div>

  if (route.kind === 'present') {
    return <PresentMode boardId={id} board={board} step={route.step} print={route.print} />
  }
  return <BoardViewer boardId={id} board={board} />
}
