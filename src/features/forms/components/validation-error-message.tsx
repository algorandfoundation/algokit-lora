export interface ValidationErrorMessageProps {
  message?: string
}

export function ValidationErrorMessage({ message }: ValidationErrorMessageProps) {
  return message ? <p>{message}</p> : <></>
}
