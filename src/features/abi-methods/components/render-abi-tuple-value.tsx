import { RenderAbiValue } from '@/features/abi-methods/components/render-abi-value'
import { AbiTupleValue } from '@/features/abi-methods/models'

type RenderABITupleValuesProps = {
  tuple: AbiTupleValue
}

export function RenderAbiTupleValue({ tuple }: RenderABITupleValuesProps) {
  return (
    <>
      <span>(</span>
      <ul className={'pl-4'}>
        {tuple.value.map((item, index, array) => (
          <li key={index}>
            <RenderAbiValue abiValue={item} />
            {index < array.length - 1 ? <span>{', '}</span> : null}
          </li>
        ))}
      </ul>
      <span>)</span>
    </>
  )
}
