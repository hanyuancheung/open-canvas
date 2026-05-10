import type { ReactNode } from 'react'

/** 逻辑坐标系下的矩形（CSS 像素，**世界坐标**）。 */
export interface Frame {
  x: number
  y: number
  w: number
  h: number
  rotation?: number
}

/** Section 背景：决定 Section 容器的视觉，不影响 render 内容。 */
export type SectionBackground =
  | { kind: 'solid'; color: string }
  | { kind: 'image'; url: string; fit?: 'cover' | 'contain' }
  | { kind: 'none' }

/** 白板背景（无限平面的底）。 */
export type BoardBackground =
  | { kind: 'solid'; color: string }
  | { kind: 'dot-grid'; color?: string; gap?: number; size?: number }
  | { kind: 'lines-grid'; color?: string; gap?: number }

export interface SectionMeta {
  /** 演讲者备注，演示模式 `演讲者视图` 显示。 */
  notes?: string
  /** 排版分组。仅供 agent skills 使用。 */
  tags?: string[]
}

export interface Section {
  /** kebab-case，board 内唯一。Inspector 锚 / PDF 页锚。 */
  id: string
  frame: Frame
  background?: SectionBackground
  meta?: SectionMeta
  /** 渲染函数。**禁止在此读 window/document**，副作用放进自己的 useEffect。 */
  render: () => ReactNode
}

export interface BoardMeta {
  title: string
  emoji?: string
  description?: string
  background?: BoardBackground
  /** 演示分辨率（PDF 导出每页尺寸）。默认 1920×1080。 */
  presentSize?: { w: number; h: number }
}

export interface BoardModule {
  meta: BoardMeta
  sections: Section[]
  /** 演示序列；省略 = 按 sections 顺序。 */
  presentOrder?: string[]
}

/** 用户在 `open-canvas.config.ts` 写的形状。 */
export interface UserConfig {
  /** 默认 `boards`，相对于工程根。 */
  boardsDir?: string
  /** dev server 端口，默认 5173。 */
  port?: number
  /** 是否开启 Inspector（dev 默认 true，build 默认 false）。 */
  inspector?: boolean
  /** 站点标题。 */
  title?: string
}

export interface ResolvedConfig extends Required<Omit<UserConfig, 'inspector'>> {
  inspector: boolean
  root: string
}
