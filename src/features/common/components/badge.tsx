import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/features/common/utils'
import { CircleDollarSign, SquareArrowRight, SquareArrowOutDownLeft, Bolt, Snowflake, ShieldCheck, Key } from 'lucide-react'
import { TransactionType } from '@/features/transactions/models'

const badgeVariants = cva(
  'ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: '',
        [TransactionType.Payment]: 'border-transparent bg-payment text-primary-foreground hover:bg-payment/80',
        [TransactionType.AssetTransfer]: 'border-transparent bg-asset-transfer text-primary-foreground hover:bg-asset-transfer/80',
        [TransactionType.AppCall]: 'border-transparent bg-application-call text-primary-foreground hover:bg-application-call/80',
        [TransactionType.AssetConfig]: 'border-transparent bg-asset-config text-primary-foreground hover:bg-asset-config/80',
        [TransactionType.AssetFreeze]: 'border-transparent bg-asset-freeze text-primary-foreground hover:bg-asset-freeze/80',
        [TransactionType.StateProof]: 'border-transparent bg-state-proof text-primary-foreground hover:bg-state-proof/80',
        [TransactionType.KeyReg]: 'border-transparent bg-key-registration text-primary-foreground hover:bg-key-registration/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const iconClasses = 'mr-1 size-4'

const transactionTypeBadgeIcon = new Map([
  [TransactionType.Payment.toString(), <CircleDollarSign className={iconClasses} />],
  [TransactionType.AssetTransfer.toString(), <SquareArrowRight className={iconClasses} />],
  [TransactionType.AppCall.toString(), <SquareArrowOutDownLeft className={iconClasses} />],
  [TransactionType.AssetConfig.toString(), <Bolt className={iconClasses} />],
  [TransactionType.AssetFreeze.toString(), <Snowflake className={iconClasses} />],
  [TransactionType.StateProof.toString(), <ShieldCheck className={iconClasses} />],
  [TransactionType.KeyReg.toString(), <Key className={iconClasses} />],
])

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const Icon = variant ? transactionTypeBadgeIcon.get(variant) : undefined

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {Icon}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
