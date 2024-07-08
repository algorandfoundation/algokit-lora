import { ReactElement } from 'react'
import { Button } from '@/features/common/components/button'
import { cn } from '@/features/common/utils'

export interface SubmitButtonProps {
  className?: string
  icon?: ReactElement
  children?: React.ReactNode
}

export function SubmitButton({ className, children, icon }: SubmitButtonProps) {
  // const { submitting } = useFormState()
  // TODO: loading state & icon
  return (
    <Button variant={'default'} type={'submit'} className={cn(className)} icon={icon}>
      {children}
    </Button>
  )
}
