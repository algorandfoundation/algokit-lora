import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/features/common/utils'

const switchVariants = cva('', {
  variants: {
    variant: {
      default: '',
    },
    size: {
      default: 'h-4 w-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})
const switchThumbVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-background',
    },
    size: {
      default: 'size-3 data-[state=checked]:translate-x-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, variant, size, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        switchVariants({ variant, size }),
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block rounded-full shadow-lg ring-0 transition-transform  data-[state=unchecked]:translate-x-0',
          switchThumbVariants({ variant, size })
        )}
      />
    </SwitchPrimitives.Root>
  )
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
