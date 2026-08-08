import type { ReactNode } from 'react'
import type { SchoolClass } from './core/models'

function ClassSidebar({
  classes,
  selectedClassId,
  onSelect,
  children,
}: {
  classes: SchoolClass[]
  selectedClassId: string | undefined
  onSelect: (id: string) => void
  children?: ReactNode
}) {
  return (
    <aside className="class-list">
      <h2>Classes</h2>
      <ul>
        {classes.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={c.id === selectedClassId ? 'class-button selected' : 'class-button'}
              onClick={() => onSelect(c.id)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
      {children}
    </aside>
  )
}

export default ClassSidebar
