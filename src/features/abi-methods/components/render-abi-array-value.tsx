import { RenderAbiValue } from '@/features/abi-methods/components/render-abi-value'
import { AbiArrayValue } from '@/features/abi-methods/models'

type Props = {
  array: AbiArrayValue
}

export function RenderAbiArrayValue({ array }: Props) {
  return (
    <>
      <span>[</span>
      <ul className={'pl-4'}>
        {array.value.map((item, index, array) => (
          <li key={index}>
            <RenderAbiValue abiValue={item} />
            {index < array.length - 1 ? <span>{', '}</span> : null}
          </li>
        ))}
      </ul>
      <span>]</span>
    </>
  )
}
