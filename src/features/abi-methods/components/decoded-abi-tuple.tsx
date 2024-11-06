import { DecodedAbiValue } from '@/features/abi-methods/components/decoded-abi-value'
import { DecodedAbiTuple as DecodedAbiTupleModel } from '@/features/abi-methods/models'

type RenderABITupleValuesProps = {
  tuple: DecodedAbiTupleModel
}

export function DecodedAbiTuple({ tuple }: RenderABITupleValuesProps) {
  if (tuple.multiline) {
    return (
      <>
        <span>(</span>
        <ul className="pl-4">
          {tuple.values.map((item, index, array) => (
            <li key={index}>
              <DecodedAbiValue abiValue={item} />
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
              <DecodedAbiValue abiValue={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>)</span>
      </>
    )
  }
}
