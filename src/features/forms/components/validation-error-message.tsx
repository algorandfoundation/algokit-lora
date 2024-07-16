export interface ValidationErrorMessageProps {
  message?: string
}

export function ValidationErrorMessage({ message }: ValidationErrorMessageProps) {
  return message ? <span className={'ml-0.5 mt-0.5 text-sm text-error'}>{message}</span> : undefined
}
