import { MultiSigModel, SignatureType } from '../models'
import { MultiSig } from './multisig'

type Props = {
  signature: MultiSigModel
}

export function Signature({ signature }: Props) {
  return <div>{signature.type === SignatureType.multiSig && <MultiSig multiSig={signature} />}</div>
}
