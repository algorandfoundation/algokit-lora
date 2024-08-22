import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiArrayValue as AbiArrayValueModel } from '@/features/abi-methods/models'

type Props = {
  array: AbiArrayValueModel
}

export function AbiArrayValue({ array }: Props) {
  return (
    <>
      <span>[</span>
      <ul className="pl-4">
        {array.values.map((item, index, array) => (
          <li key={index}>
            <AbiValue abiValue={item} />
            {index < array.length - 1 ? <span>{', '}</span> : null}
          </li>
        ))}
      </ul>
      <span>]</span>
    </>
  )
}
