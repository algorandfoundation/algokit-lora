import { DecodedAbiValue } from '@/features/abi-methods/components/decoded-abi-value'
import { DecodedAbiArray as AbiArrayModel } from '@/features/abi-methods/models'

type Props = {
  array: AbiArrayModel
}

export function DecodedAbiArray({ array }: Props) {
  if (array.multiline) {
    return (
      <>
        <span>[</span>
        <ol className="pl-4">
          {array.values.map((item, index, array) => (
            <li key={index}>
              <DecodedAbiValue abiValue={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </li>
          ))}
        </ol>
        <span>]</span>
      </>
    )
  } else {
    return (
      <>
        <span>[</span>
        <div className="inline">
          {array.values.map((item, index, array) => (
            <div className="inline" key={index}>
              <DecodedAbiValue abiValue={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>]</span>
      </>
    )
  }
}
