import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiTupleValue as AbiTupleModel } from '@/features/abi-methods/models'

type RenderABITupleValuesProps = {
  tuple: AbiTupleModel
}

export function AbiTupleValue({ tuple }: RenderABITupleValuesProps) {
  if (tuple.multiline) {
    return (
      <>
        <span>(</span>
        <ul className="pl-4">
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
  } else {
    return (
      <>
        <span>(</span>
        <div className="inline">
          {tuple.values.map((item, index, array) => (
            <div className="inline" key={index}>
              <AbiValue abiValue={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>)</span>
      </>
    )
  }
}
