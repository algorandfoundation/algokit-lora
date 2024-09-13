import { cn } from '@/features/common/utils'
import { ReactElement } from 'react'

export interface Props {
  errorText?: string
  helpText?: string | ReactElement
}

export function HintText({ errorText, helpText }: Props) {
  if (!errorText && !helpText) {
    return undefined
  }

  // TODO: consider making this always take up some space so that styling the remove button is easier
  return (
    <span className={cn('ml-0.5 mt-0.5 text-sm', errorText ? 'text-error' : 'text-muted-foreground')}>
      {errorText ?? helpText ?? undefined}
    </span>
  )
}
