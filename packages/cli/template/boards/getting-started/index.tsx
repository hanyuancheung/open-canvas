import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: {
    title: 'Getting Started',
    emoji: '🎨',
    description: 'A whirlwind tour of open-canvas.',
    background: { kind: 'dot-grid', color: '#cbd5e1' },
  },
  sections: [
    defineSection({
      id: 'hello',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      meta: { notes: 'Open with a strong opener; thank the audience.' },
      render: () => (
        <div
          style={{
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            color: 'white',
            padding: 48,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, opacity: 0.85 }}>welcome to</div>
            <h1 style={{ fontSize: 144, margin: '8px 0', letterSpacing: -4 }}>
              open-canvas
            </h1>
            <div style={{ fontSize: 24, opacity: 0.85 }}>
              a whiteboard framework, built for agents
            </div>
          </div>
        </div>
      ),
    }),
    defineSection({
      id: 'why',
      frame: { x: 1480, y: 0, w: 1600, h: 900 },
      meta: { notes: 'Three columns: agent-native, infinite, exportable.' },
      render: () => (
        <div style={{ height: '100%', padding: 64, background: 'white' }}>
          <h2 style={{ fontSize: 56, margin: 0 }}>Why open-canvas?</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
              marginTop: 48,
            }}
          >
            {[
              { t: 'Agent-native', d: '/create-board, /add-section, /apply-comments' },
              { t: 'Infinite', d: 'free pan/zoom, sections of any size' },
              { t: 'Exportable', d: 'static site + one-shot PDF' },
            ].map((c) => (
              <div
                key={c.t}
                style={{
                  padding: 32,
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  background: '#f8fafc',
                }}
              >
                <h3 style={{ fontSize: 28, margin: 0 }}>{c.t}</h3>
                <p style={{ fontSize: 18, color: '#475569', marginTop: 16 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    }),
    defineSection({
      id: 'how',
      frame: { x: 200, y: 1100, w: 2400, h: 900 },
      meta: { notes: 'Show the dev/inspector loop.' },
      background: { kind: 'solid', color: '#0f172a' },
      render: () => (
        <div style={{ height: '100%', padding: 80, color: 'white' }}>
          <h2 style={{ fontSize: 64, margin: 0 }}>How it feels</h2>
          <ol style={{ fontSize: 28, lineHeight: 1.8, marginTop: 32 }}>
            <li>Tell your agent what to draw.</li>
            <li>
              Agent edits <code>boards/&lt;id&gt;/index.tsx</code>; HMR keeps the canvas live.
            </li>
            <li>
              Press <kbd>⌘I</kbd> · click anything · drop a comment.
            </li>
            <li>
              Agent runs <code>/apply-comments</code> · changes ship.
            </li>
            <li>
              Press <kbd>P</kbd> to present, or run <code>open-canvas export pdf</code>.
            </li>
          </ol>
        </div>
      ),
    }),
  ],
  presentOrder: ['hello', 'why', 'how'],
})
