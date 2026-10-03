import clsx from 'clsx'
import { TriangleAlert, Inbox, LoaderCircle, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

type Kind = 'loading' | 'empty' | 'no-match' | 'error'

const icons = { loading: LoaderCircle, empty: Inbox, 'no-match': SearchX, error: TriangleAlert }

export function StateMessage({
  kind,
  title,
  body,
  action,
  className,
}: {
  kind: Kind
  title: string
  body?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const Icon = icons[kind]
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={clsx('flex flex-col items-center px-6 py-12 text-center', className)}
    >
      <div
        className={clsx(
          'mb-4 grid size-12 place-items-center rounded-pill',
          kind === 'error' ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600',
        )}
      >
        <Icon className={clsx('size-6', kind === 'loading' && 'animate-spin')} />
      </div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}