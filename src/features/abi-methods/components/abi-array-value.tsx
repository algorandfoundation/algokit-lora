import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiArrayValue as AbiArrayModel } from '@/features/abi-methods/models'

type Props = {
  array: AbiArrayModel
}

export function AbiArrayValue({ array }: Props) {
  if (array.multiline) {
    return (
      <>
        <span>[</span>
        <ol className="pl-4">
          {array.values.map((item, index, array) => (
            <li key={index}>
              <AbiValue abiValue={item} />
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
              <AbiValue abiValue={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>]</span>
      </>
    )
  }
}
