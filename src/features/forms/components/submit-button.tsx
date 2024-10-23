import { ReactElement } from 'react'
import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'
import { Loader2 as Loader } from 'lucide-react'
import * as React from 'react'
import { useFormState } from 'react-hook-form'

export interface SubmitButtonProps {
  className?: string
  icon?: ReactElement
  children?: React.ReactNode
  disabled?: boolean
  disabledReason?: string
}

export function SubmitButton({ className, children, icon, disabled, disabledReason }: SubmitButtonProps) {
  const { isSubmitting } = useFormState()

  return (
    <Button
      variant="default"
      type="submit"
      className={cn(className)}
      disabled={disabled}
      disabledReason={!isSubmitting ? disabledReason : undefined}
    >
      {isSubmitting && <Loader className="size-6 animate-spin" />}
      {!isSubmitting && icon && (
        <div className="flex items-center gap-2">
          {icon}
          {children}
        </div>
      )}
      {!isSubmitting && !icon && <>{children}</>}
    </Button>
  )
}
