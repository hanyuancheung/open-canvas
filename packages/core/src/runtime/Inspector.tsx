import { useEffect, useRef, useState } from 'react'

interface InspectorProps {
  enabled: boolean
}

interface ActiveTarget {
  el: HTMLElement
  loc: string
  rect: DOMRect
}

/**
 * 浏览器内 Inspector：
 * - Cmd/Ctrl + I 切换。
 * - 进入后悬停带 `data-oc-loc` 的元素时高亮，点击弹出输入框。
 * - 提交评论 → POST /__open-canvas__/comments → 注入 `// @canvas-comment[id=...]: ...` 到源码上一行。
 *
 * 通过把视觉反馈直接编码到源码注释里，让 agent 能在下一轮对话中
 * 用 `apply-comments` skill 闭环消费这些反馈、写回代码并清理标记。
 */
export function Inspector({ enabled }: InspectorProps) {
  const [active, setActive] = useState(false)
  const [target, setTarget] = useState<ActiveTarget | null>(null)
  const [editing, setEditing] = useState<ActiveTarget | null>(null)
  const lastEl = useRef<HTMLElement | null>(null)

  // 切换快捷键
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault()
        setActive((v) => !v)
        setTarget(null)
        setEditing(null)
      } else if (e.key === 'Escape') {
        setEditing(null)
        setActive(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])

  // 鼠标 hover / click 拦截
  useEffect(() => {
    if (!active || editing) return
    const onMove = (e: MouseEvent) => {
      const el = findLocAncestor(e.target as HTMLElement | null)
      if (el === lastEl.current) return
      lastEl.current = el
      if (!el) {
        setTarget(null)
        return
      }
      setTarget({ el, loc: el.dataset.ocLoc ?? '', rect: el.getBoundingClientRect() })
    }
    const onClick = (e: MouseEvent) => {
      const el = findLocAncestor(e.target as HTMLElement | null)
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      setEditing({
        el,
        loc: el.dataset.ocLoc ?? '',
        rect: el.getBoundingClientRect(),
      })
      setTarget(null)
    }
    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [active, editing])

  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        className={`oc-inspector__toggle ${active ? 'is-on' : ''}`}
        onClick={() => setActive((v) => !v)}
        title="Toggle inspector (⌘I)"
      >
        🔍 Inspect
      </button>
      {active && target && !editing && (
        <div
          className="oc-inspector__hover"
          style={{
            left: target.rect.left,
            top: target.rect.top,
            width: target.rect.width,
            height: target.rect.height,
          }}
        >
          <span className="oc-inspector__loc">{target.loc}</span>
        </div>
      )}
      {editing && <CommentForm target={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function findLocAncestor(el: HTMLElement | null): HTMLElement | null {
  let cur = el
  while (cur && cur !== document.body) {
    if (cur.dataset && cur.dataset.ocLoc) return cur
    cur = cur.parentElement
  }
  return null
}

function CommentForm({ target, onClose }: { target: ActiveTarget; onClose: () => void }) {
  const [text, setText] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = async () => {
    if (!text.trim()) return
    setPending(true)
    setError(null)
    try {
      const id = `cmt_${Math.random().toString(36).slice(2, 10)}`
      const res = await fetch('/__open-canvas__/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, loc: target.loc, text: text.trim() }),
      })
      if (!res.ok) throw new Error(await res.text())
      onClose()
    } catch (e) {
      setError((e as Error).message)
      setPending(false)
    }
  }

  const left = Math.min(window.innerWidth - 360, target.rect.left)
  const top = Math.min(window.innerHeight - 200, target.rect.bottom + 8)

  return (
    <div className="oc-inspector__form" style={{ left, top }}>
      <div className="oc-inspector__form-loc">{target.loc}</div>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. 把标题改成红色，缩小字号"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          if (e.key === 'Escape') onClose()
        }}
      />
      {error && <div className="oc-inspector__form-error">{error}</div>}
      <div className="oc-inspector__form-bar">
        <button type="button" onClick={onClose} disabled={pending}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={pending || !text.trim()}>
          {pending ? 'Saving…' : 'Save (⌘↵)'}
        </button>
      </div>
    </div>
  )
}
