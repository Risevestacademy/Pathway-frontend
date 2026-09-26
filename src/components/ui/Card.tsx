import clsx from 'clsx'
import type { ComponentProps } from 'react'

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={clsx('bg-surface border border-line rounded-lg shadow-card', className)} {...rest} />
}