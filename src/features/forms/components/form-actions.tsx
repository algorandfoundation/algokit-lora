import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/features/common/utils'

export interface FormActionsProps {
  className?: string
  children?: ReactNode
  onInit?: () => void
}

export function FormActions({ className, children, onInit }: FormActionsProps) {
  const [isInitialised, setIsInitialised] = useState(false)

  useEffect(() => {
    if (!isInitialised) {
      onInit?.()
      setIsInitialised(true)
    }
  }, [isInitialised, onInit])

  return <div className={cn('mt-4 flex gap-2 justify-end', className)}>{children}</div>
}
