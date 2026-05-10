import type { Frame } from '../types'

/** 屏幕视口的相机状态。translate 单位为屏幕像素，zoom 为缩放系数。 */
export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface ScreenSize {
  width: number
  height: number
}

export const MIN_ZOOM = 0.05
export const MAX_ZOOM = 8

export function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
}

/** 屏幕坐标 → 世界坐标。 */
export function screenToWorld(viewport: Viewport, sx: number, sy: number) {
  return {
    x: (sx - viewport.x) / viewport.zoom,
    y: (sy - viewport.y) / viewport.zoom,
  }
}

/** 计算把 frame 居中适配到 screen 的相机；padding 为 frame 四周的留白比例。 */
export function fitFrame(frame: Frame, screen: ScreenSize, padding = 0.08): Viewport {
  const padW = screen.width * (1 - padding * 2)
  const padH = screen.height * (1 - padding * 2)
  const zoom = clampZoom(Math.min(padW / frame.w, padH / frame.h))
  const cx = frame.x + frame.w / 2
  const cy = frame.y + frame.h / 2
  return {
    zoom,
    x: screen.width / 2 - cx * zoom,
    y: screen.height / 2 - cy * zoom,
  }
}

/** 适配把所有 frames 整体放进屏幕。 */
export function fitAll(frames: Frame[], screen: ScreenSize, padding = 0.06): Viewport {
  if (frames.length === 0) return { x: 0, y: 0, zoom: 1 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const f of frames) {
    if (f.x < minX) minX = f.x
    if (f.y < minY) minY = f.y
    if (f.x + f.w > maxX) maxX = f.x + f.w
    if (f.y + f.h > maxY) maxY = f.y + f.h
  }
  return fitFrame({ x: minX, y: minY, w: maxX - minX, h: maxY - minY }, screen, padding)
}

/** 以光标为锚点缩放：保证 (sx, sy) 对应的世界点在缩放前后不变。 */
export function zoomAt(viewport: Viewport, sx: number, sy: number, factor: number): Viewport {
  const next = clampZoom(viewport.zoom * factor)
  const k = next / viewport.zoom
  return {
    zoom: next,
    x: sx - (sx - viewport.x) * k,
    y: sy - (sy - viewport.y) * k,
  }
}

/** 标准缓动：cubic-bezier(.22, 1, .36, 1) 的近似（出门即停）。 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t)
}

export function lerpViewport(a: Viewport, b: Viewport, t: number): Viewport {
  const k = easeOutExpo(t)
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    zoom: a.zoom + (b.zoom - a.zoom) * k,
  }
}
