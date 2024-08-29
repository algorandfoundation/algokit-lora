import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/features/common/utils'

export interface FormActionsProps {
  className?: string
  children?: ReactNode
  onInitialise?: () => void
}

export function FormActions({ className, children, onInitialise }: FormActionsProps) {
  const [isInitialised, setIsInitialised] = useState(false)

  useEffect(() => {
    if (!isInitialised) {
      onInitialise && onInitialise()
      setIsInitialised(true)
    }
  }, [isInitialised, onInitialise])

  return <div className={cn('mt-4 flex gap-2 justify-end', className)}>{children}</div>
}
