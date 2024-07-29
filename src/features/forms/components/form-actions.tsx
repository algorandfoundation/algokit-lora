import { ReactNode } from 'react'
import { cn } from '@/features/common/utils'

export interface FormActionsProps {
  className?: string
  children?: ReactNode
}

export function FormActions({ className, children }: FormActionsProps) {
  return <div className={cn('mt-4 flex gap-2 justify-end', className)}>{children}</div>
}
