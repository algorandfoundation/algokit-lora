import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/features/common/utils'
import { useCallback, useState } from 'react'
import { Loader2 as Loader } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        ['outline-secondary']: 'border border-secondary bg-transparent text-secondary hover:bg-accent hover:text-secondary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        ['no-style']: '',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-6 rounded-sm px-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  disabledReason?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, icon, disabledReason, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const button = (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {icon && (
          <div className="flex items-center gap-2">
            {icon}
            {children}
          </div>
        )}
        {!icon && <>{children}</>}
      </Comp>
    )

    if (props.disabled && disabledReason) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div tabIndex={0}>{button}</div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{disabledReason}</span>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
Button.displayName = 'Button'

export interface AsyncActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  onClick?: () => Promise<void>
  icon?: React.ReactNode
  disabledReason?: string
}

const AsyncActionButton = React.forwardRef<HTMLButtonElement, AsyncActionButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      onClick: onClickProp,
      disabled: disabledProp,
      disabledReason: disabledReasonProp,
      icon,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false)

    const onClick = useCallback(async () => {
      if (onClickProp) {
        setIsLoading(true)
        try {
          await onClickProp()
        } finally {
          setIsLoading(false)
        }
      }
    }, [onClickProp])

    const disabled = disabledProp || isLoading
    const disabledReason = !isLoading ? disabledReasonProp : undefined // If loading, that's the reason the button is disabled, so don't show the disabled reason

    const Comp = asChild ? Slot : 'button'
    const button = (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled} onClick={onClick} {...props}>
        {isLoading && <Loader className="size-6 animate-spin" />}
        {!isLoading && icon && (
          <div className="flex items-center gap-2">
            {icon}
            {children}
          </div>
        )}
        {!isLoading && !icon && <>{children}</>}
      </Comp>
    )

    if (disabled && disabledReason) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div tabIndex={0}>{button}</div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{disabledReason}</span>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
AsyncActionButton.displayName = 'AsyncActionButton'

export { Button, buttonVariants, AsyncActionButton }
