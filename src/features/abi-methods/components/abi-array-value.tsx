import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiArrayRender } from '@/features/abi-methods/models'

type Props = {
  array: AbiArrayRender
}

export function AbiArrayValue({ array }: Props) {
  if (array.multiLine) {
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
