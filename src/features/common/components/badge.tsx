import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/features/common/utils'
import { CircleDollarSign, SquareArrowRight, Bolt, Snowflake, ShieldCheck, Key, Parentheses, HeartPulse } from 'lucide-react'
import { TransactionType } from '@/features/transactions/models'

const badgeVariants = cva(
  'focus:ring-ring inline-flex h-5 items-center truncate rounded-md border px-1.5 py-0.5 text-xs tracking-tighter transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80 border-transparent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
        outline: '',
        [TransactionType.Payment]: 'bg-payment text-primary-foreground border-transparent',
        [TransactionType.AssetTransfer]: 'bg-asset-transfer text-primary-foreground border-transparent',
        [TransactionType.AppCall]: 'bg-application-call text-primary-foreground border-transparent',
        [TransactionType.AssetConfig]: 'bg-asset-config text-primary-foreground border-transparent',
        [TransactionType.AssetFreeze]: 'bg-asset-freeze text-primary-foreground border-transparent',
        [TransactionType.StateProof]: 'bg-state-proof text-primary-foreground border-transparent',
        [TransactionType.KeyReg]: 'bg-key-registration text-primary-foreground border-transparent',
        [TransactionType.Heartbeat]: 'bg-heartbeat text-primary-foreground border-transparent',
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
  [TransactionType.AppCall.toString(), <Parentheses className={iconClasses} />],
  [TransactionType.AssetConfig.toString(), <Bolt className={iconClasses} />],
  [TransactionType.AssetFreeze.toString(), <Snowflake className={iconClasses} />],
  [TransactionType.StateProof.toString(), <ShieldCheck className={iconClasses} />],
  [TransactionType.KeyReg.toString(), <Key className={iconClasses} />],
  [TransactionType.Heartbeat.toString(), <HeartPulse className={iconClasses} />],
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
