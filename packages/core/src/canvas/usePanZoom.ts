import { useCallback, useEffect, useRef, useState } from 'react'
import { type Viewport, lerpViewport, zoomAt } from './viewport'

interface UsePanZoomOptions {
  initial?: Viewport
  /** Whether holding Space is required before drag-panning (avoids conflicts with interactive content inside Sections). */
  spaceToPan?: boolean
}

/**
 * Infinite canvas pan + zoom interaction hook.
 *
 * Design:
 * - Wheel: Cmd/Ctrl or ctrlKey (trackpad pinch browser behavior) = zoom; otherwise = pan.
 * - Middle-click / Space+left-click = drag pan.
 * - All zoom anchored at cursor position to prevent visual jumping.
 */
export function usePanZoom(
  ref: React.RefObject<HTMLElement>,
  { initial = { x: 0, y: 0, zoom: 1 }, spaceToPan = true }: UsePanZoomOptions = {},
) {
  const [viewport, setViewport] = useState<Viewport>(initial)
  const viewportRef = useRef<Viewport>(initial)
  const spaceDown = useRef(false)
  const dragging = useRef<{ startX: number; startY: number; vx: number; vy: number } | null>(null)
  const animRef = useRef<number | null>(null)

  // Sync viewport state → ref so event callbacks always read the latest value
  viewportRef.current = viewport

  /** Smoothly animate to target viewport; duration in ms. */
  const animateTo = useCallback((target: Viewport, duration = 480) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const from = viewportRef.current
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setViewport(lerpViewport(from, target, t))
      if (t < 1) animRef.current = requestAnimationFrame(tick)
      else animRef.current = null
    }
    animRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
        animRef.current = null
      }
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
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
        animRef.current = null
      }
      el.setPointerCapture(e.pointerId)
      const vp = viewportRef.current
      dragging.current = {
        startX: e.clientX,
        startY: e.clientY,
        vx: vp.x,
        vy: vp.y,
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
    }
  }, [ref, spaceToPan])

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return { viewport, setViewport, animateTo }
}
