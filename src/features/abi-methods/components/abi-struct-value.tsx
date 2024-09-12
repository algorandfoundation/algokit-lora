import { AbiValue } from '@/features/abi-methods/components/abi-value'
import { AbiStructValue as AbiStructValueModel } from '@/features/abi-methods/models'

type Props = {
  struct: AbiStructValueModel
}

export function AbiStructValue({ struct }: Props) {
  if (struct.multiline) {
    return (
      <>
        <span>{'{'}</span>
        <ul className="pl-4">
          {struct.values.map((item, index, array) => (
            <li key={index}>
              <span>{item.name}: </span>
              <AbiValue abiValue={item.value} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </li>
          ))}
        </ul>
        <span>{'}'}</span>
      </>
    )
  } else {
    return (
      <>
        <span>{'{'}</span>
        <div className="inline">
          {struct.values.map((item, index, array) => (
            <div className="inline" key={index}>
              <span>{item.name}: </span>
              <AbiValue abiValue={item.value} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>{'}'}</span>
      </>
    )
  }
}
