import algosdk from 'algosdk'
import { RenderABIValue } from '@/features/abi-methods/components/render-abi-type-value'

type RenderABITupleValuesProps = {
  type: algosdk.ABITupleType
  values: algosdk.ABIValue[]
}

export function RenderABITupleValues({ type, values }: RenderABITupleValuesProps) {
  return (
    <>
      <>(</>
      <ul className={'pl-4'}>
        {values.map((value, index, array) => (
          <li key={index}>
            <RenderABIValue type={type.childTypes[index]} value={value} />
            {index < array.length - 1 ? ',' : ''}
          </li>
        ))}
      </ul>
      <>)</>
    </>
  )
}
