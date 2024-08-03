import { useMemo } from 'react'
import { AbiMethod, AbiValueType } from '@/features/abi-methods/models'
import { RenderAbiPrimitiveValue } from '@/features/abi-methods/components/render-abi-primitive-value'

export function DecodedAbiMethodArguments({ method }: { method: AbiMethod }) {
  const components = useMemo(
    () =>
      method.arguments.map((argument) => {
        if (argument.type === AbiValueType.Transaction) {
          return `${argument.name}: ${argument.value}`
        }
        if (argument.type === AbiValueType.Account) {
          return `${argument.name}: ${argument.value}`
        }
        if (argument.type === AbiValueType.Application) {
          return `${argument.name}: ${argument.value}`
        }
        if (argument.type === AbiValueType.Asset) {
          return `${argument.name}: ${argument.value}`
        }
        return (
          <div className="inline">
            <span>{argument.name}: </span> <RenderAbiPrimitiveValue abiValue={argument} />
          </div>
        )
      }),
    [method.arguments]
  )

  return (
    <ul className={'pl-4'}>
      {components.map((component, index, arr) => (
        <li key={index}>
          <>
            {component}
            {index < arr.length - 1 ? <span>{', '}</span> : null}
          </>
        </li>
      ))}
    </ul>
  )
}
