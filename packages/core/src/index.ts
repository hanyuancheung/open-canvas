import type { BoardModule, Section, UserConfig } from './types'

/**
 * 定义一块白板。提供编译期/编辑器内的类型守卫与默认值。
 *
 * @example
 * export default defineBoard({
 *   meta: { title: 'Intro', background: { kind: 'dot-grid' } },
 *   sections: [defineSection({ id: 'hi', frame: { x: 0, y: 0, w: 1280, h: 720 }, render: () => <Hi/> })],
 * })
 */
export function defineBoard(board: BoardModule): BoardModule {
  validateBoard(board)
  return board
}

/** 定义一个 Section。在严格模式下校验 id 与 frame。 */
export function defineSection(section: Section): Section {
  if (!KEBAB.test(section.id)) {
    throw new Error(
      `[open-canvas] Section.id must be kebab-case, got "${section.id}".`,
    )
  }
  if (section.frame.w <= 0 || section.frame.h <= 0) {
    throw new Error(`[open-canvas] Section "${section.id}" frame must be positive.`)
  }
  return section
}

/** 定义用户配置（仅类型友好，不做转换）。 */
export function defineConfig(config: UserConfig): UserConfig {
  return config
}

const KEBAB = /^[a-z][a-z0-9-]*$/

function validateBoard(board: BoardModule) {
  const seen = new Set<string>()
  for (const s of board.sections) {
    if (seen.has(s.id)) {
      throw new Error(`[open-canvas] Duplicate section id "${s.id}" in a single board.`)
    }
    seen.add(s.id)
  }
  if (board.presentOrder) {
    for (const id of board.presentOrder) {
      if (!seen.has(id)) {
        throw new Error(`[open-canvas] presentOrder references unknown section "${id}".`)
      }
    }
  }
}

export type { BoardModule, BoardMeta, Section, SectionMeta, Frame } from './types'
export type { SectionBackground, BoardBackground, UserConfig, ResolvedConfig } from './types'
