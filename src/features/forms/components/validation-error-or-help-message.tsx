import clsx from 'clsx'
import { ReactElement } from 'react'

export interface ValidationErrorMessageProps {
  errorText?: string
  helpText?: string | ReactElement
}

export function ValidationErrorOrHelpMessage({ errorText, helpText }: ValidationErrorMessageProps) {
  return (
    <span className={clsx('ml-0.5 mt-0.5 text-sm', errorText ? 'text-error' : 'text-muted-foreground')}>
      {errorText ?? helpText ?? undefined}
    </span>
  )
}
