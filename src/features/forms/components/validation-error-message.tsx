export interface ValidationErrorMessageProps {
  message?: string
}

export function ValidationErrorMessage({ message }: ValidationErrorMessageProps) {
  return message ? <span className={'mt-1 text-error'}>{message}</span> : <></>
}
