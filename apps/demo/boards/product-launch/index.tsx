import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: {
    title: 'Product Launch Q4',
    emoji: '🚀',
    background: { kind: 'lines-grid', color: '#e2e8f0', gap: 80 },
  },
  sections: [
    defineSection({
      id: 'cover',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      render: () => (
        <div
          style={{
            height: '100%',
            padding: 80,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ fontSize: 24, opacity: 0.85 }}>October 2026</div>
          <h1 style={{ fontSize: 120, margin: 0, lineHeight: 1.05 }}>
            Launch
            <br />
            Plan
          </h1>
        </div>
      ),
    }),
    defineSection({
      id: 'goals',
      frame: { x: 1480, y: 0, w: 1600, h: 720 },
      render: () => (
        <div style={{ height: '100%', padding: 64 }}>
          <h2 style={{ fontSize: 56, margin: 0 }}>Three goals</h2>
          <ul style={{ fontSize: 28, lineHeight: 1.6, marginTop: 32, color: '#0f172a' }}>
            <li>Ship the public beta to 10k waitlisted users.</li>
            <li>Launch on Hacker News, Twitter, and Product Hunt the same day.</li>
            <li>Hit 1k GitHub stars in week one.</li>
          </ul>
        </div>
      ),
    }),
    defineSection({
      id: 'timeline',
      frame: { x: 0, y: 920, w: 3080, h: 720 },
      render: () => (
        <div style={{ height: '100%', padding: 80, background: 'white' }}>
          <h2 style={{ fontSize: 56, margin: 0 }}>Eight-week timeline</h2>
          <div
            style={{
              marginTop: 48,
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 16,
            }}
          >
            {['T-8', 'T-7', 'T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1'].map((w, i) => (
              <div
                key={w}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  background: i >= 5 ? '#f59e0b' : '#e2e8f0',
                  color: i >= 5 ? 'white' : '#0f172a',
                }}
              >
                <div style={{ fontSize: 18, opacity: 0.7 }}>{w}</div>
                <div style={{ fontSize: 22, marginTop: 8, fontWeight: 600 }}>
                  {['Plan', 'Build', 'Build', 'QA', 'QA', 'Press', 'Press', 'Launch'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    }),
  ],
  presentOrder: ['cover', 'goals', 'timeline'],
})
