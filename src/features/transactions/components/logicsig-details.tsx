import { Logicsig } from '../models'
import { ApplicationProgram } from '@/features/applications/components/application-program'

type LogicsigProps = {
  signature: Logicsig
}

export const logicsigLabel = 'View Logic Signature Details'

// TODO: refactor this to use the new program component
export function LogicsigDetails({ signature }: LogicsigProps) {
  return <ApplicationProgram tabsListAriaLabel={logicsigLabel} base64Program={signature.logic} />
}
