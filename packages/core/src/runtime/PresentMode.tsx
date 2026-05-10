import { useEffect, useMemo, useRef, useState } from 'react'
import { fitFrame } from '../canvas/viewport'
import { lerpViewport } from '../canvas/viewport'
import type { BoardModule, Section } from '../types'

interface PresentModeProps {
  boardId: string
  board: BoardModule
  step: number
  /** print=1 用于 PDF 导出：禁用动画，1:1 渲染目标 frame，无 UI。 */
  print: boolean
}

export function PresentMode({ boardId, board, step, print }: PresentModeProps) {
  const order = useMemo(() => {
    if (board.presentOrder?.length) {
      const map = new Map(board.sections.map((s) => [s.id, s]))
      return board.presentOrder.map((id) => map.get(id)).filter(Boolean) as Section[]
    }
    return board.sections
  }, [board])

  const safeStep = Math.min(Math.max(0, step), Math.max(0, order.length - 1))
  const current = order[safeStep]

  const screenRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })
  const animRef = useRef<number | null>(null)
  const [startTime, setStartTime] = useState<number>(() => Date.now())
  const [showSpeaker, setShowSpeaker] = useState(false)

  // 监听尺寸
  useEffect(() => {
    const el = screenRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 切换到当前 step：缓动过渡，print 模式直接定位
  useEffect(() => {
    if (!current || size.width === 0) return
    const target = fitFrame(current.frame, size, print ? 0 : 0.04)
    if (print) {
      setViewport(target)
      return
    }
    const start = performance.now()
    const from = viewport
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 600)
      setViewport(lerpViewport(from, target, t))
      if (t < 1) animRef.current = requestAnimationFrame(tick)
    }
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
    // 只在 step / size / print 变化时重算；viewport 自身递推
  }, [current, size.width, size.height, print])

  // 键盘
  useEffect(() => {
    if (print) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        navigate(boardId, Math.min(order.length - 1, safeStep + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        navigate(boardId, Math.max(0, safeStep - 1))
      } else if (e.key === 'Home') {
        navigate(boardId, 0)
      } else if (e.key === 'End') {
        navigate(boardId, order.length - 1)
      } else if (e.key === 'Escape') {
        window.location.hash = `#/${boardId}`
      } else if (e.key === ',') {
        setShowSpeaker((v) => !v)
      } else if (e.key === 'b' || e.key === 'B') {
        document.body.classList.toggle('oc-blackout')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [boardId, order.length, safeStep, print])

  useEffect(() => {
    setStartTime(Date.now())
  }, [boardId])

  if (!current) {
    return <div style={{ padding: 24 }}>Empty board.</div>
  }

  return (
    <div className={`oc-screen oc-present ${print ? 'oc-print' : ''}`} ref={screenRef}>
      <div
        className="oc-world"
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {board.sections.map((s) => (
          <PresentSection key={s.id} section={s} active={s.id === current.id} />
        ))}
      </div>

      {!print && (
        <>
          <footer className="oc-present__bar">
            <button type="button" onClick={() => navigate(boardId, safeStep - 1)}>
              ←
            </button>
            <span>
              {safeStep + 1} / {order.length} · {current.id}
            </span>
            <button type="button" onClick={() => navigate(boardId, safeStep + 1)}>
              →
            </button>
            <span className="oc-toolbar__spacer" />
            <Timer start={startTime} />
            <a href={`#/${boardId}`}>Esc</a>
          </footer>
          {showSpeaker && (
            <SpeakerView current={current} next={order[safeStep + 1]} startTime={startTime} />
          )}
        </>
      )}
    </div>
  )
}

function navigate(boardId: string, step: number) {
  window.location.hash = `#/${boardId}/present?step=${step}`
}

function PresentSection({ section, active }: { section: Section; active: boolean }) {
  const Render = section.render
  const bg = section.background ?? { kind: 'solid' as const, color: '#ffffff' }
  return (
    <div
      data-oc-section-id={section.id}
      style={{
        position: 'absolute',
        left: section.frame.x,
        top: section.frame.y,
        width: section.frame.w,
        height: section.frame.h,
        overflow: 'hidden',
        borderRadius: 12,
        background: bg.kind === 'solid' ? bg.color : '#fff',
        opacity: active ? 1 : 0.18,
        transition: 'opacity .35s ease',
      }}
    >
      <Render />
    </div>
  )
}

function Timer({ start }: { start: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])
  const sec = Math.floor((now - start) / 1000)
  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  return (
    <span className="oc-timer">
      {mm}:{ss}
    </span>
  )
}

function SpeakerView({
  current,
  next,
  startTime,
}: {
  current: Section
  next?: Section
  startTime: number
}) {
  return (
    <aside className="oc-speaker">
      <h4>Speaker view</h4>
      <div className="oc-speaker__notes">
        <strong>Current · {current.id}</strong>
        <p>{current.meta?.notes ?? '(no notes)'}</p>
      </div>
      {next && (
        <div className="oc-speaker__next">
          <strong>Next · {next.id}</strong>
        </div>
      )}
      <Timer start={startTime} />
    </aside>
  )
}
