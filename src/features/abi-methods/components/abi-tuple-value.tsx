import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiTupleValue as AbiTupleValueModel } from '@/features/abi-methods/models'

type RenderABITupleValuesProps = {
  tuple: AbiTupleValueModel
}

export function AbiTupleValue({ tuple }: RenderABITupleValuesProps) {
  return (
    <>
      <span>(</span>
      <ul className={'pl-4'}>
        {tuple.values.map((item, index, array) => (
          <li key={index}>
            <AbiValue abiValue={item} />
            {index < array.length - 1 ? <span>{', '}</span> : null}
          </li>
        ))}
      </ul>
      <span>)</span>
    </>
  )
}
