import { ReactNode } from 'react'
import { cn } from '@/features/common/utils'

export interface FormActionsProps {
  className?: string
  children?: ReactNode
}

export function FormActions({ className, children }: FormActionsProps) {
  return (
    <div className={cn(className)}>
      <div className={cn()}>{children}</div>
    </div>
  )
}
