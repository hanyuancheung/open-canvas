import path from 'node:path'
import fs from 'node:fs/promises'
import type { Connect, Plugin, ViteDevServer } from 'vite'

const COMMENT_TAG = '@canvas-comment'

interface PostCommentBody {
  loc: string
  text: string
  id: string
}

/**
 * 暴露 `POST /__open-canvas__/comments`：
 * 把 `// @canvas-comment[id=…]: <text>` 注入到 `<file>:<line>` 的上一行。
 * 评论以源码注释形式就地持久化，由 agent 通过 `apply-comments` skill 消费并清理；
 * 选这一形式而非外部数据库，是为了让反馈与代码同进出版本控制、永不丢失。
 */
export function commentsApiPlugin(opts: { root: string }): Plugin {
  return {
    name: 'open-canvas:comments-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__open-canvas__/comments', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const body = await readJson<PostCommentBody>(req)
          await injectComment(opts.root, body)
          res.statusCode = 204
          res.end()
        } catch (err) {
          res.statusCode = 400
          res.end((err as Error).message)
        }
      })
    },
  }
}

async function injectComment(root: string, body: PostCommentBody) {
  if (!body.loc || !body.text || !body.id) throw new Error('loc/text/id required')
  const [rel, lineStr] = body.loc.split(':')
  const line = Number(lineStr)
  if (!rel || !Number.isFinite(line) || line < 1) throw new Error(`bad loc: ${body.loc}`)
  if (rel.includes('..')) throw new Error('loc traversal forbidden')
  const abs = path.join(root, rel)
  // 确保目标文件位于 root 下，防止越权写入
  if (!abs.startsWith(path.resolve(root) + path.sep)) {
    throw new Error('loc traversal forbidden')
  }
  const src = await fs.readFile(abs, 'utf8')
  const lines = src.split('\n')
  const i = Math.min(Math.max(0, line - 1), lines.length - 1)
  const indent = lines[i]!.match(/^\s*/)?.[0] ?? ''
  const sanitized = body.text.replace(/\r?\n/g, ' ').slice(0, 500)
  const tag = `${indent}// ${COMMENT_TAG}[id=${body.id}]: ${sanitized}`
  lines.splice(i, 0, tag)
  await fs.writeFile(abs, lines.join('\n'), 'utf8')
}

function readJson<T>(req: Connect.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as T)
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}
