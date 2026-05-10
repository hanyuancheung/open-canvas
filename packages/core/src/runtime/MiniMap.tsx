import { useMemo } from 'react'
import type { BoardModule } from '../types'

interface MiniMapProps {
  board: BoardModule
  viewport: { x: number; y: number; zoom: number }
  screen: { width: number; height: number }
}

const MAP_W = 200
const MAP_H = 140
const PADDING = 8

/** 右下角小地图：展示所有 Section 与当前视口窗口。 */
export function MiniMap({ board, viewport, screen }: MiniMapProps) {
  const bbox = useMemo(() => {
    if (board.sections.length === 0) return null
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const s of board.sections) {
      const { x, y, w, h } = s.frame
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x + w > maxX) maxX = x + w
      if (y + h > maxY) maxY = y + h
    }
    return { minX, minY, w: maxX - minX, h: maxY - minY }
  }, [board])

  if (!bbox || screen.width === 0) return null

  const innerW = MAP_W - PADDING * 2
  const innerH = MAP_H - PADDING * 2
  const k = Math.min(innerW / bbox.w, innerH / bbox.h)
  const offX = PADDING + (innerW - bbox.w * k) / 2
  const offY = PADDING + (innerH - bbox.h * k) / 2

  // 当前视口在世界坐标的窗口
  const winW = screen.width / viewport.zoom
  const winH = screen.height / viewport.zoom
  const winX = -viewport.x / viewport.zoom
  const winY = -viewport.y / viewport.zoom

  return (
    <div className="oc-minimap" style={{ width: MAP_W, height: MAP_H }}>
      <svg width={MAP_W} height={MAP_H}>
        <rect width={MAP_W} height={MAP_H} fill="rgba(15,23,42,0.04)" rx={6} />
        {board.sections.map((s) => (
          <rect
            key={s.id}
            x={offX + (s.frame.x - bbox.minX) * k}
            y={offY + (s.frame.y - bbox.minY) * k}
            width={Math.max(2, s.frame.w * k)}
            height={Math.max(2, s.frame.h * k)}
            fill="#94a3b8"
            opacity={0.55}
          />
        ))}
        <rect
          x={offX + (winX - bbox.minX) * k}
          y={offY + (winY - bbox.minY) * k}
          width={winW * k}
          height={winH * k}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  )
}
