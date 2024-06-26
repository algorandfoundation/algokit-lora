import { cn } from '@/features/common/utils'
import { Logicsig } from '../models'
import { ApplicationProgram } from '@/features/applications/components/application-program'

type LogicsigProps = {
  signature: Logicsig
}

export const logicsigLabel = 'View Logic Signature Details'

export function LogicsigDetails({ signature }: LogicsigProps) {
  return (
    <div className={cn('space-y-2')}>
      <h3>LogicSig</h3>
      <ApplicationProgram tabsListAriaLabel={logicsigLabel} base64Program={signature.logic} />
    </div>
  )
}
