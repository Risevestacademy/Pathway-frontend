import clsx from 'clsx'
import type { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'unavailable'

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        {
          neutral: 'bg-surface-muted text-ink-muted',
          brand: 'bg-brand-50 text-brand-700',
          accent: 'bg-accent-50 text-accent-800',
          success: 'bg-success-50 text-success-700',
          warning: 'bg-warning-50 text-warning-700',
          danger: 'bg-danger-50 text-danger-700',
          info: 'bg-info-50 text-info-700',
          unavailable: 'bg-unavailable-bg text-unavailable-ink',
        }[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}