import { useCallback, useEffect, useRef, useState } from 'react'
import { type Viewport, lerpViewport, zoomAt } from './viewport'

interface UsePanZoomOptions {
  initial?: Viewport
  /** 是否需要按住空格键才允许拖拽平移（避免与点击 Section 内的可交互内容冲突）。 */
  spaceToPan?: boolean
}

/**
 * 实现无限画布的平移 + 缩放交互。
 *
 * 设计要点：
 * - 滚轮：Cmd/Ctrl 或 ctrlKey（触控板捏合的浏览器表现）= 缩放；否则 = 平移。
 * - 鼠标中键 / 空格+左键 = 拖拽平移。
 * - 所有缩放以鼠标位置为锚，避免视觉跳动。
 */
export function usePanZoom(
  ref: React.RefObject<HTMLElement>,
  { initial = { x: 0, y: 0, zoom: 1 }, spaceToPan = true }: UsePanZoomOptions = {},
) {
  const [viewport, setViewport] = useState<Viewport>(initial)
  const spaceDown = useRef(false)
  const dragging = useRef<{ startX: number; startY: number; vx: number; vy: number } | null>(null)
  const animRef = useRef<number | null>(null)

  /** 平滑过渡到目标 viewport，duration 单位 ms。 */
  const animateTo = useCallback((target: Viewport, duration = 480) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const start = performance.now()
    setViewport((from) => {
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setViewport(lerpViewport(from, target, t))
        if (t < 1) animRef.current = requestAnimationFrame(tick)
        else animRef.current = null
      }
      animRef.current = requestAnimationFrame(tick)
      return from
    })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.0015)
        setViewport((vp) => zoomAt(vp, sx, sy, factor))
      } else {
        setViewport((vp) => ({ ...vp, x: vp.x - e.deltaX, y: vp.y - e.deltaY }))
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = false
    }

    const onPointerDown = (e: PointerEvent) => {
      const allow = e.button === 1 || (e.button === 0 && (!spaceToPan || spaceDown.current))
      if (!allow) return
      e.preventDefault()
      el.setPointerCapture(e.pointerId)
      dragging.current = {
        startX: e.clientX,
        startY: e.clientY,
        vx: viewport.x,
        vy: viewport.y,
      }
    }
    const onPointerMove = (e: PointerEvent) => {
      const d = dragging.current
      if (!d) return
      setViewport((vp) => ({
        ...vp,
        x: d.vx + (e.clientX - d.startX),
        y: d.vy + (e.clientY - d.startY),
      }))
    }
    const onPointerUp = (e: PointerEvent) => {
      if (dragging.current) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {}
      }
      dragging.current = null
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
    // viewport 在拖拽起点被读取一次；后续位移用 d.vx + delta，因此无需重订阅
  }, [ref, spaceToPan, viewport.x, viewport.y])

  return { viewport, setViewport, animateTo }
}
