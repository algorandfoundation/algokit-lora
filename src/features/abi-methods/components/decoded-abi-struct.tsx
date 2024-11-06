import {
  DecodedAbiStruct as DecodedAbiStructModel,
  DecodedAbiStructField as DecodedAbiStructFieldModel,
} from '@/features/abi-methods/models'
import { DecodedAbiValue } from '@/features/abi-methods/components/decoded-abi-value'

type Props = {
  struct: DecodedAbiStructModel
}

export function DecodedAbiStruct({ struct }: Props) {
  if (struct.multiline) {
    return (
      <>
        <span>{'{'}</span>
        <ul className="pl-4">
          {struct.fields.map((item, index, array) => (
            <li key={index}>
              <DecodedAbiStructField structField={item} />
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
          {struct.fields.map((item, index, array) => (
            <div className="inline" key={index}>
              <DecodedAbiStructField structField={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>{'}'}</span>
      </>
    )
  }
}

function DecodedAbiStructField({ structField }: { structField: DecodedAbiStructFieldModel }) {
  if (!Array.isArray(structField.value)) {
    return (
      <>
        <span>{structField.name}: </span>
        <DecodedAbiValue abiValue={structField.value} />
      </>
    )
  }

  if (structField.multiline) {
    return (
      <>
        <span>
          {structField.name}:{' {'}
        </span>
        <ul className="pl-4">
          {structField.value.map((item, index, array) => (
            <li key={index}>
              <DecodedAbiStructField structField={item} />
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
        <span>
          {structField.name}:{' {'}
        </span>
        <div className="inline">
          {structField.value.map((item, index, array) => (
            <div className="inline" key={index}>
              <DecodedAbiStructField structField={item} />
              {index < array.length - 1 ? <span>{', '}</span> : null}
            </div>
          ))}
        </div>
        <span>{'}'}</span>
      </>
    )
  }
}
