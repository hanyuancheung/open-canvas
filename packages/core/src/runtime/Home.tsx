interface HomeProps {
  boardIds: string[]
}

export function Home({ boardIds }: HomeProps) {
  return (
    <div className="oc-home">
      <header className="oc-home__header">
        <h1>open-canvas</h1>
        <p>Pick a board, or ask your agent to <code>/create-board</code>.</p>
      </header>
      {boardIds.length === 0 ? (
        <div className="oc-home__empty">
          <p>
            No boards yet. Create one at{' '}
            <code>boards/&lt;your-id&gt;/index.tsx</code>.
          </p>
        </div>
      ) : (
        <ul className="oc-home__list">
          {boardIds.map((id) => (
            <li key={id}>
              <a href={`#/${id}`} className="oc-home__card">
                <span className="oc-home__card-id">{id}</span>
                <span className="oc-home__card-meta">open canvas →</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
