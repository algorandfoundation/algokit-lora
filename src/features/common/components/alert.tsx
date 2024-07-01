import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/features/common/utils'

const alertVariants = cva('flex w-full items-center gap-2 border-b px-4 py-3 text-sm animate-in fade-in-0 [&>svg]:text-foreground', {
  variants: {
    variant: {
      default: 'bg-accent text-foreground',
      destructive: 'bg-destructive/20 dark:bg-destructive/40',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
  ({ className, variant, ...props }, ref) => <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
)
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }
