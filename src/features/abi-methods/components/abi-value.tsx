import { AbiArrayValue } from '@/features/abi-methods/components/abi-array-value'
import { AbiTupleValue } from '@/features/abi-methods/components/abi-tuple-value'
import { AbiValueRender, AbiType } from '@/features/abi-methods/models'
import { AccountLink } from '@/features/accounts/components/account-link'

type Props = {
  abiValue: AbiValueRender
}

export function AbiValue({ abiValue }: Props) {
  if (abiValue.type === AbiType.Tuple) {
    return <AbiTupleValue tuple={abiValue} />
  }
  if (abiValue.type === AbiType.Array) {
    return <AbiArrayValue array={abiValue} />
  }
  if (abiValue.type === AbiType.String) {
    return <span className="text-abi-string">{`"${abiValue.value}"`}</span>
  }
  if (abiValue.type === AbiType.Number) {
    return <span className="text-abi-number">{`${abiValue.value}`}</span>
  }
  if (abiValue.type === AbiType.Boolean) {
    return <span className="text-abi-bool">{`${abiValue.value}`}</span>
  }
  if (abiValue.type === AbiType.Address) {
    return (
      <AccountLink className="text-primary underline" address={abiValue.value}>
        {abiValue.value}
      </AccountLink>
    )
  }
}
