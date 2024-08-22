import { cn } from '@/features/common/utils'
import { ReactElement } from 'react'

export interface ValidationErrorMessageProps {
  errorText?: string
  helpText?: string | ReactElement
}

export function ValidationErrorOrHelpMessage({ errorText, helpText }: ValidationErrorMessageProps) {
  return (
    <span className={cn('ml-0.5 mt-0.5 text-sm', errorText ? 'text-error' : 'text-muted-foreground')}>
      {errorText ?? helpText ?? undefined}
    </span>
  )
}
