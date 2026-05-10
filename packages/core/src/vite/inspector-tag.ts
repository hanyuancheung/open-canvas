import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * 给每个 *打开* 的 JSX 元素注入 `data-oc-loc="<relative-path>:<line>:<col>"`。
 * 仅在 dev 或显式 `--inspector` 构建时启用。
 *
 * 实现方式：基于源码扫描而非 AST，足以覆盖 `boards/<id>/index.{tsx,jsx}`
 * 中的常见写法。该插件**只**注入到开标签：
 *   - `<Tag`、`<Tag>`、`<Tag/>`、`<Tag prop>` 都会被注入
 *   - `</Tag>`（闭标签）不注入
 *   - JSX Fragment `<>` / `</>` 不注入（无法定位到具体元素）
 *   - 字符串、模板串、`/* … *\/` 与 `// …` 注释中的 `<` 不被识别为标签
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
      return { code: injectLocs(code, rel), map: null }
    },
  }
}

const TAG_NAME_HEAD = /[A-Za-z_$]/
const TAG_NAME_BODY = /[A-Za-z0-9_.$:-]/
const ATTR_INSERT_NEXT = new Set([' ', '\t', '\n', '\r', '>', '/'])

/** 把 `<Tag` 之后插入 `data-oc-loc="rel:line:col"`；闭标签与 fragment 不动。 */
export function injectLocs(code: string, rel: string): string {
  let out = ''
  let line = 1
  let col = 1
  const n = code.length
  let i = 0

  // 简化的 mode 跟踪：跳过字符串 / 模板串 / 单行注释 / 多行注释
  while (i < n) {
    const ch = code[i]!
    const next = code[i + 1]

    // 多行注释
    if (ch === '/' && next === '*') {
      const j = code.indexOf('*/', i + 2)
      const end = j === -1 ? n : j + 2
      const seg = code.slice(i, end)
      out += seg
      advance(seg)
      i = end
      continue
    }
    // 单行注释
    if (ch === '/' && next === '/') {
      const j = code.indexOf('\n', i)
      const end = j === -1 ? n : j
      const seg = code.slice(i, end)
      out += seg
      advance(seg)
      i = end
      continue
    }
    // 普通字符串
    if (ch === '"' || ch === "'") {
      const end = scanQuoted(code, i, ch)
      const seg = code.slice(i, end)
      out += seg
      advance(seg)
      i = end
      continue
    }
    // 模板串（不处理 ${...} 中的 JSX，open-canvas 模板内不会出现）
    if (ch === '`') {
      const end = scanTemplate(code, i)
      const seg = code.slice(i, end)
      out += seg
      advance(seg)
      i = end
      continue
    }
    // JSX 开标签
    if (ch === '<' && next && TAG_NAME_HEAD.test(next)) {
      const tagStartLine = line
      const tagStartCol = col
      out += '<'
      i++
      col++
      // 抓 TagName
      while (i < n && TAG_NAME_BODY.test(code[i]!)) {
        out += code[i]
        i++
        col++
      }
      // 只在合法插入点注入
      const after = code[i]
      if (after !== undefined && ATTR_INSERT_NEXT.has(after)) {
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
  return out

  function advance(seg: string) {
    for (const c of seg) {
      if (c === '\n') {
        line++
        col = 1
      } else {
        col++
      }
    }
  }
}

function scanQuoted(code: string, from: number, q: string): number {
  let i = from + 1
  while (i < code.length) {
    const c = code[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === q) return i + 1
    i++
  }
  return code.length
}

function scanTemplate(code: string, from: number): number {
  let i = from + 1
  while (i < code.length) {
    const c = code[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === '`') return i + 1
    i++
  }
  return code.length
}
