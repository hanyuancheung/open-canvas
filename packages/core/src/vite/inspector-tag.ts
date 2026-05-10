import path from 'node:path'
import fs from 'node:fs/promises'
import type { Plugin } from 'vite'

/**
 * 给每个 JSX 元素注入 `data-oc-loc="<relative-path>:<line>:<col>"`。
 * 仅在 dev 或显式 `--inspector` 构建时启用。
 *
 * 实现方式：用 esbuild 已经做过的源码 AST 不可得，所以采用基于正则的轻量注入——
 * 仅匹配 `boards/**\/index.{tsx,jsx}` 内、形如 `<Tag` 的位置，附加属性。
 * 对 fragment、自闭合标签均生效。
 *
 * 这是 Inspector 闭环的关键基础：把渲染后的 DOM 节点反查到源码行列，
 * 从而能在用户点击元素后，把评论精确注入到对应的源代码位置。
 */
export function inspectorTagPlugin(opts: { root: string; boardsDir: string }): Plugin {
  const boardsAbs = path.resolve(opts.root, opts.boardsDir) + path.sep

  return {
    name: 'open-canvas:inspector-tag',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.(t|j)sx$/.test(id)) return null
      if (!id.startsWith(boardsAbs)) return null
      const rel = path.relative(opts.root, id).replace(/\\/g, '/')

      // 跟踪行列。简化策略：扫描原文，识别 `<TagName`（合法标识符首字符），
      // 在第一个标签属性插入点（即 TagName 后）注入 data-oc-loc。
      let out = ''
      let line = 1
      let col = 1
      let i = 0
      const n = code.length
      while (i < n) {
        const ch = code[i]!
        if (ch === '<' && isTagStart(code, i)) {
          const tagStartLine = line
          const tagStartCol = col
          // 复制 `<` 与 TagName
          out += ch
          i++
          col++
          while (i < n && /[A-Za-z0-9_.:-]/.test(code[i]!)) {
            out += code[i]
            i++
            col++
          }
          // 仅当下一字符是空白 / `>` / `/`时才注入；防止误伤泛型 `<T>` 等场景仍可能漏过
          const next = code[i]
          if (next === ' ' || next === '\n' || next === '\t' || next === '>' || next === '/') {
            out += ` data-oc-loc=${JSON.stringify(`${rel}:${tagStartLine}:${tagStartCol}`)}`
          }
          continue
        }
        out += ch
        if (ch === '\n') {
          line++
          col = 1
        } else {
          col++
        }
        i++
      }
      return { code: out, map: null }
    },
  }
}

/** 判断 `<` 之后是否是合法标签起点（避免吞掉 `<` 比较运算等）。 */
function isTagStart(src: string, i: number): boolean {
  const c = src[i + 1]
  if (!c) return false
  // <Foo, <foo, </Foo, <Fragment 都是标签
  return /[A-Za-z/]/.test(c)
}
