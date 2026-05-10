import { useEffect, useMemo, useRef, useState } from 'react'
import { fitAll, fitFrame } from '../canvas/viewport'
import { usePanZoom } from '../canvas/usePanZoom'
import type { BoardModule, Section } from '../types'
import { Inspector } from './Inspector'
import { MiniMap } from './MiniMap'

interface BoardViewerProps {
  boardId: string
  board: BoardModule
}

export function BoardViewer({ boardId, board }: BoardViewerProps) {
  const screenRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // 初始相机：fit 全部 sections
  const initial = useMemo(() => {
    if (size.width === 0) return { x: 0, y: 0, zoom: 1 }
    return fitAll(
      board.sections.map((s) => s.frame),
      size,
    )
  }, [board, size])

  const { viewport, animateTo } = usePanZoom(screenRef, { initial, spaceToPan: true })

  // 监听容器尺寸
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

  // 键盘：P 进入演示，0 fit-all，1 100%
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).closest('input, textarea, [contenteditable]'))
        return
      if (e.key === 'p' || e.key === 'P') {
        window.location.hash = `#/${boardId}/present?step=0`
      } else if (e.key === '0') {
        animateTo(fitAll(board.sections.map((s) => s.frame), size))
      } else if (e.key === '1') {
        animateTo({ x: size.width / 2, y: size.height / 2, zoom: 1 })
      } else if (e.key === 'f' || e.key === 'F') {
        const s = board.sections[0]
        if (s) animateTo(fitFrame(s.frame, size))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [boardId, board, size, animateTo])

  return (
    <div className="oc-screen" ref={screenRef}>
      <BoardBackdrop board={board} viewport={viewport} />
      <div
        className="oc-world"
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {board.sections.map((s) => (
          <SectionShell key={s.id} section={s} />
        ))}
      </div>

      <header className="oc-toolbar">
        <a href="#/" className="oc-toolbar__home">←</a>
        <span className="oc-toolbar__title">
          {board.meta.emoji ? `${board.meta.emoji} ` : ''}
          {board.meta.title}
        </span>
        <span className="oc-toolbar__spacer" />
        <button
          type="button"
          onClick={() => animateTo(fitAll(board.sections.map((s) => s.frame), size))}
        >
          Fit
        </button>
        <a href={`#/${boardId}/present?step=0`} className="oc-toolbar__present">
          Present (P) ▶
        </a>
      </header>

      <MiniMap board={board} viewport={viewport} screen={size} />
      <Inspector enabled={typeof __OPEN_CANVAS_INSPECTOR__ !== 'undefined' && __OPEN_CANVAS_INSPECTOR__} />
    </div>
  )
}

function BoardBackdrop({
  board,
  viewport,
}: {
  board: BoardModule
  viewport: { x: number; y: number; zoom: number }
}) {
  const bg = board.meta.background ?? { kind: 'dot-grid' as const }
  if (bg.kind === 'solid') {
    return <div className="oc-backdrop" style={{ background: bg.color }} />
  }
  if (bg.kind === 'lines-grid') {
    const gap = (bg.gap ?? 80) * viewport.zoom
    const color = bg.color ?? '#e5e7eb'
    return (
      <div
        className="oc-backdrop"
        style={{
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: `${gap}px ${gap}px`,
          backgroundPosition: `${viewport.x % gap}px ${viewport.y % gap}px`,
        }}
      />
    )
  }
  // dot-grid (default)
  const gap = (bg.gap ?? 32) * viewport.zoom
  const dot = (bg.size ?? 1.5) * Math.max(0.6, Math.min(1.4, viewport.zoom))
  const color = bg.color ?? '#cbd5e1'
  return (
    <div
      className="oc-backdrop"
      style={{
        backgroundImage: `radial-gradient(${color} ${dot}px, transparent ${dot + 0.5}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${viewport.x % gap}px ${viewport.y % gap}px`,
      }}
    />
  )
}

function SectionShell({ section }: { section: Section }) {
  const Render = section.render
  const bg = section.background ?? { kind: 'solid' as const, color: '#ffffff' }
  const style: React.CSSProperties = {
    position: 'absolute',
    left: section.frame.x,
    top: section.frame.y,
    width: section.frame.w,
    height: section.frame.h,
    transform: section.frame.rotation ? `rotate(${section.frame.rotation}deg)` : undefined,
    overflow: 'hidden',
    borderRadius: 12,
    boxShadow: '0 1px 0 rgba(15,23,42,0.04), 0 8px 32px rgba(15,23,42,0.06)',
    background: bg.kind === 'solid' ? bg.color : '#fff',
    backgroundImage:
      bg.kind === 'image'
        ? `url(${bg.url})`
        : undefined,
    backgroundSize: bg.kind === 'image' ? bg.fit ?? 'cover' : undefined,
  }
  return (
    <div data-oc-section-id={section.id} style={style}>
      <Render />
    </div>
  )
}

declare const __OPEN_CANVAS_INSPECTOR__: boolean
